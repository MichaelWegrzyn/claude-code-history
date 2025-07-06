import { createReadStream } from 'node:fs';
import type { ClaudeMessage } from '@shared/types/conversation.js';

function isValidMessage(data: any): boolean {
  if (!data || typeof data !== 'object' || !data.type) {
    return false;
  }
  
  // Summary records have leafUuid instead of uuid
  if (data.type === 'summary') {
    return !!(data.leafUuid && data.summary);
  }
  
  // System records have content instead of message
  if (data.type === 'system') {
    return !!(data.uuid && data.content);
  }
  
  // Regular messages need uuid and other fields
  return !!(data.uuid && (data.type === 'user' || data.type === 'assistant'));
}

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
          const data = JSON.parse(line) as any;
          
          if (isValidMessage(data)) {
            // Skip summary and system records - they're not conversation messages
            if (data.type !== 'summary' && data.type !== 'system') {
              yield data as ClaudeMessage;
            }
          } else {
            console.warn(`Skipping invalid record on line ${lineNumber} in ${filePath}:`, 
              data.type ? `type=${data.type}` : 'missing type');
          }
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
      const data = JSON.parse(buffer) as any;
      
      if (isValidMessage(data)) {
        // Skip summary and system records - they're not conversation messages
        if (data.type !== 'summary' && data.type !== 'system') {
          yield data as ClaudeMessage;
        }
      } else {
        console.warn(`Skipping invalid final record on line ${lineNumber} in ${filePath}:`, 
          data.type ? `type=${data.type}` : 'missing type');
      }
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