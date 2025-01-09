// pages/api/transcribe.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import formidable from 'formidable';
import { createReadStream, createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export const config = {
  api: {
    bodyParser: false
  }
};

const convertToMp3 = (inputPath: string): Promise<string> => {
  const outputPath = inputPath.replace('.webm', '.mp3');
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('error', (err) => reject(err))
      .on('end', () => resolve(outputPath))
      .save(outputPath);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // Parse form data
    const form = formidable({
      keepExtensions: true,
    });
    
    const [_, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const audioFiles = files.audio;
    if (!audioFiles || !Array.isArray(audioFiles) || audioFiles.length === 0) {
      throw new Error('No audio file provided');
    }

    const audioFile = audioFiles[0];
    console.log('Processing audio file:', {
      originalFilename: audioFile.originalFilename,
      mimetype: audioFile.mimetype,
      size: audioFile.size
    });

    inputPath = audioFile.filepath;
    
    // Convert WebM to MP3
    console.log('Converting to MP3...');
    outputPath = await convertToMp3(inputPath);
    
    // Create a read stream from the MP3 file
    const audioStream = createReadStream(outputPath);

    // Get transcription from Whisper
    console.log('Getting transcription...');
    const transcript = await openai.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-1',
      response_format: 'json'
    });

    console.log('Transcript received:', transcript.text);

    // Get response from Claude
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: transcript.text
      }]
    });

    return res.status(200).json({
      userMessage: { role: 'user', content: transcript.text },
      assistantMessage: { role: 'assistant', content: message.content[0].text }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up temporary files
    try {
      if (inputPath) await unlink(inputPath);
      if (outputPath) await unlink(outputPath);
    } catch (err) {
      console.error('Error cleaning up files:', err);
    }
  }
}