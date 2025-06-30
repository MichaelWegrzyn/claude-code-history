import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { Readable } from 'node:stream';
import type { ClaudeMessage } from '@shared/types/conversation.js';

export async function* parseJSONLStream(filePath: string): AsyncGenerator<ClaudeMessage, void, unknown> {
  const stream = createReadStream(filePath, { encoding: 'utf8' });
  let buffer = '';
  let lineNumber = 0;

  for await (const chunk of stream) {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      lineNumber++;
      if (line.trim()) {
        try {
          const data = JSON.parse(line) as ClaudeMessage;
          yield data;
        } catch (error) {
          console.error(`Error parsing line ${lineNumber} in ${filePath}:`, error);
          // Continue parsing other lines
        }
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim()) {
    lineNumber++;
    try {
      const data = JSON.parse(buffer) as ClaudeMessage;
      yield data;
    } catch (error) {
      console.error(`Error parsing final line ${lineNumber} in ${filePath}:`, error);
    }
  }
}

export async function parseJSONLFile(filePath: string): Promise<ClaudeMessage[]> {
  const messages: ClaudeMessage[] = [];
  
  try {
    for await (const message of parseJSONLStream(filePath)) {
      messages.push(message);
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  
  return messages;
}

export async function parseJSONLBatch(filePaths: string[]): Promise<Map<string, ClaudeMessage[]>> {
  const results = new Map<string, ClaudeMessage[]>();
  
  await Promise.all(
    filePaths.map(async (filePath) => {
      const messages = await parseJSONLFile(filePath);
      results.set(filePath, messages);
    })
  );
  
  return results;
}