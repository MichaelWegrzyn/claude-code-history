import type { ConversationSession, ClaudeMessage, ConversationSummary } from '@shared/types/conversation.js';

export class SummaryGenerator {
  
  generateSummary(session: ConversationSession): ConversationSummary {
    const analysis = this.analyzeConversation(session);
    
    const summary: ConversationSummary = {
      id: session.id,
      projectPath: session.projectPath,
      generatedAt: new Date(),
      keyDecisions: analysis.keyDecisions,
      solutions: analysis.solutions,
      filesModified: analysis.filesModified,
      summary: this.generateTextSummary(analysis),
      markdown: this.generateMarkdownSummary(session, analysis),
    };

    return summary;
  }

  private analyzeConversation(session: ConversationSession) {
    const keyDecisions: string[] = [];
    const solutions: string[] = [];
    const filesModified: string[] = [];
    const toolsUsed = new Set<string>();
    const codeLanguages = new Set<string>();
    const topics = new Set<string>();

    if (!Array.isArray(session.messages)) {
      console.warn('Session messages is not an array:', session);
      return {
        keyDecisions: [],
        solutions: [],
        filesModified: [],
        toolsUsed: [],
        codeLanguages: [],
        topics: [],
        messageCount: 0,
        tokenUsage: { input: 0, output: 0, cache: 0 },
        duration: '0 minutes',
      };
    }

    try {
      for (let i = 0; i < session.messages.length; i++) {
        const message = session.messages[i];
        if (!message) continue;
      if (message.type === 'assistant') {
        // Extract solutions and decisions from assistant messages
        const content = this.extractTextContent(message);
        
        // Look for decision-making language
        if (this.containsDecisionLanguage(content)) {
          const decision = this.extractDecision(content);
          if (decision) keyDecisions.push(decision);
        }

        // Look for solution language
        if (this.containsSolutionLanguage(content)) {
          const solution = this.extractSolution(content);
          if (solution) solutions.push(solution);
        }
      }

        // Extract file operations and tools used
        const messageAnalysis = this.analyzeMessage(message);
        if (Array.isArray(messageAnalysis.filesModified)) {
          for (const file of messageAnalysis.filesModified) {
            if (typeof file === 'string') filesModified.push(file);
          }
        }
        if (Array.isArray(messageAnalysis.toolsUsed)) {
          for (const tool of messageAnalysis.toolsUsed) {
            if (typeof tool === 'string') toolsUsed.add(tool);
          }
        }
        if (Array.isArray(messageAnalysis.codeLanguages)) {
          for (const lang of messageAnalysis.codeLanguages) {
            if (typeof lang === 'string') codeLanguages.add(lang);
          }
        }
        if (Array.isArray(messageAnalysis.topics)) {
          for (const topic of messageAnalysis.topics) {
            if (typeof topic === 'string') topics.add(topic);
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    }

    return {
      keyDecisions: keyDecisions.filter((item, index, arr) => arr.indexOf(item) === index),
      solutions: solutions.filter((item, index, arr) => arr.indexOf(item) === index),
      filesModified: filesModified.filter((item, index, arr) => arr.indexOf(item) === index),
      toolsUsed: Array.from(toolsUsed),
      codeLanguages: Array.from(codeLanguages),
      topics: Array.from(topics),
      messageCount: session.messageCount || 0,
      tokenUsage: session.tokenUsage || { input: 0, output: 0, cache: 0 },
      duration: this.calculateSessionDuration(session),
    };
  }

  private analyzeMessage(message: ClaudeMessage) {
    const result = {
      filesModified: [] as string[],
      toolsUsed: [] as string[],
      codeLanguages: [] as string[],
      topics: [] as string[],
    };

    if (!message.message || !message.message.content) {
      return result;
    }

    const content = message.message.content;
    
    if (typeof content === 'string') {
      // Extract programming languages from code blocks
      const codeBlockMatches = content.match(/```(\w+)/g);
      if (codeBlockMatches) {
        codeBlockMatches.forEach(match => {
          const lang = match.replace('```', '');
          if (lang) result.codeLanguages.push(lang);
        });
      }
      
      // Extract topics from content
      result.topics.push(...this.extractTopics(content));
      return result;
    }

    if (Array.isArray(content)) {
      try {
        for (let i = 0; i < content.length; i++) {
          const item = content[i];
          if (!item || typeof item !== 'object') continue;
          
          if (item.type === 'tool_use') {
            result.toolsUsed.push(item.name || 'unknown');
            
            // Extract file paths from tool parameters
            if (item.input && typeof item.input === 'object') {
              const filePath = item.input.file_path || item.input.path || item.input.filePath;
              if (typeof filePath === 'string') {
                result.filesModified.push(filePath);
              }
            }
          }
          
          if (item.type === 'text' && typeof item.text === 'string') {
            // Extract code languages and topics from text content
            const codeBlockMatches = item.text.match(/```(\w+)/g);
            if (codeBlockMatches && Array.isArray(codeBlockMatches)) {
              for (const match of codeBlockMatches) {
                const lang = match.replace('```', '');
                if (lang) result.codeLanguages.push(lang);
              }
            }
            
            const topics = this.extractTopics(item.text);
            if (Array.isArray(topics)) {
              for (const topic of topics) {
                result.topics.push(topic);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error analyzing message content:', error);
      }
    }

    return result;
  }

  private extractTextContent(message: ClaudeMessage): string {
    if (!message.message || !message.message.content) {
      return '';
    }

    const content = message.message.content;
    
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      try {
        const textItems = [];
        for (const item of content) {
          if (item && typeof item === 'object' && item.type === 'text' && item.text) {
            textItems.push(item.text.toString());
          }
        }
        return textItems.join(' ');
      } catch (error) {
        console.error('Error extracting text content:', error);
        return '';
      }
    }

    return '';
  }

  private containsDecisionLanguage(text: string): boolean {
    const decisionKeywords = [
      'decided to', 'chose to', 'selected', 'picked', 'opted for',
      'will use', 'should use', 'recommend', 'suggest', 'better approach',
      'best practice', 'prefer', 'instead of'
    ];
    
    const lowerText = text.toLowerCase();
    return decisionKeywords.some(keyword => lowerText.includes(keyword));
  }

  private containsSolutionLanguage(text: string): boolean {
    const solutionKeywords = [
      'solution', 'fix', 'resolve', 'solve', 'answer', 'approach',
      'here\'s how', 'you can', 'try this', 'use this', 'implement',
      'add this', 'change this', 'update', 'modify'
    ];
    
    const lowerText = text.toLowerCase();
    return solutionKeywords.some(keyword => lowerText.includes(keyword));
  }

  private extractDecision(text: string): string | null {
    // Extract the sentence containing the decision
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (this.containsDecisionLanguage(sentence)) {
        return sentence.trim().slice(0, 200); // Limit length
      }
    }
    
    return null;
  }

  private extractSolution(text: string): string | null {
    // Extract the sentence containing the solution
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (this.containsSolutionLanguage(sentence)) {
        return sentence.trim().slice(0, 200); // Limit length
      }
    }
    
    return null;
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Common programming topics
    const topicKeywords = [
      'react', 'typescript', 'javascript', 'python', 'node.js', 'express',
      'database', 'sql', 'mongodb', 'api', 'rest', 'graphql',
      'testing', 'debugging', 'error', 'bug', 'performance',
      'authentication', 'authorization', 'security', 'deployment',
      'docker', 'git', 'github', 'npm', 'package', 'dependency'
    ];
    
    for (const keyword of topicKeywords) {
      if (lowerText.includes(keyword)) {
        topics.push(keyword);
      }
    }
    
    return topics;
  }

  private calculateSessionDuration(session: ConversationSession): string {
    if (session.messages.length === 0) return '0 minutes';
    
    const firstMessage = session.messages[0];
    const lastMessage = session.messages[session.messages.length - 1];
    
    const startTime = new Date(firstMessage?.timestamp || new Date().toISOString());
    const endTime = new Date(lastMessage?.timestamp || new Date().toISOString());
    
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    if (durationMinutes === 0) return 'Less than 1 minute';
    if (durationMinutes < 60) return `${durationMinutes} minute${durationMinutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(durationMinutes / 60);
    const remainingMinutes = durationMinutes % 60;
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  private generateTextSummary(analysis: any): string {
    const parts: string[] = [];
    
    // Determine session type based on tools and content
    const sessionType = this.determineSessionType(analysis);
    parts.push(`${sessionType} session with ${analysis.messageCount} messages over ${analysis.duration}.`);
    
    // Main activities
    if (analysis.filesModified.length > 0) {
      const fileTypes = this.categorizeFiles(analysis.filesModified);
      parts.push(`Modified ${analysis.filesModified.length} file${analysis.filesModified.length !== 1 ? 's' : ''} (${fileTypes}).`);
    }
    
    // Programming context
    if (analysis.codeLanguages.length > 0) {
      parts.push(`Worked with ${analysis.codeLanguages.join(', ')}.`);
    }
    
    // Key accomplishments
    if (analysis.solutions.length > 0) {
      parts.push(`Implemented ${analysis.solutions.length} solution${analysis.solutions.length !== 1 ? 's' : ''}.`);
    }
    
    if (analysis.keyDecisions.length > 0) {
      parts.push(`Made ${analysis.keyDecisions.length} important decision${analysis.keyDecisions.length !== 1 ? 's' : ''}.`);
    }
    
    // Tools and approach
    if (analysis.toolsUsed.length > 0) {
      const toolSummary = this.summarizeTools(analysis.toolsUsed);
      parts.push(toolSummary);
    }
    
    // Token efficiency
    const tokenUsage = analysis.tokenUsage || { input: 0, output: 0, cache: 0 };
    const totalTokens = tokenUsage.input + tokenUsage.output;
    const efficiency = this.calculateEfficiency(totalTokens, analysis.messageCount);
    parts.push(`Used ${totalTokens.toLocaleString()} tokens (${efficiency}).`);
    
    return parts.join(' ');
  }

  private determineSessionType(analysis: any): string {
    const tools = analysis.toolsUsed;
    const hasEdit = tools.includes('Edit') || tools.includes('MultiEdit');
    const hasRead = tools.includes('Read');
    const hasTask = tools.includes('Task');
    
    if (hasEdit && hasRead) {
      return 'Development';
    } else if (hasTask && hasRead) {
      return 'Analysis';
    } else if (hasEdit) {
      return 'Coding';
    } else if (hasRead) {
      return 'Review';
    } else {
      return 'Discussion';
    }
  }

  private categorizeFiles(files: string[]): string {
    const types = new Set<string>();
    
    files.forEach(file => {
      const ext = file.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'ts':
        case 'tsx':
          types.add('TypeScript');
          break;
        case 'js':
        case 'jsx':
          types.add('JavaScript');
          break;
        case 'py':
          types.add('Python');
          break;
        case 'json':
          types.add('config');
          break;
        case 'md':
          types.add('docs');
          break;
        case 'css':
        case 'scss':
          types.add('styles');
          break;
        default:
          types.add('other');
      }
    });
    
    return Array.from(types).join(', ');
  }

  private summarizeTools(tools: string[]): string {
    const toolCounts = tools.reduce((acc, tool) => {
      acc[tool] = (acc[tool] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mainTools = Object.entries(toolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tool, count]) => count > 1 ? `${tool} (${count}x)` : tool);
    
    return `Primary tools: ${mainTools.join(', ')}.`;
  }

  private calculateEfficiency(totalTokens: number, messageCount: number): string {
    const tokensPerMessage = Math.round(totalTokens / messageCount);
    
    if (tokensPerMessage < 200) {
      return 'efficient';
    } else if (tokensPerMessage < 500) {
      return 'moderate';
    } else {
      return 'intensive';
    }
  }

  private generateMarkdownSummary(session: ConversationSession, analysis: any): string {
    const projectName = session.projectPath.split('/').pop() || 'Unknown Project';
    const date = new Date().toLocaleDateString();
    
    let markdown = `# Conversation Summary\n\n`;
    markdown += `**Project:** ${projectName}  \n`;
    markdown += `**Date:** ${date}  \n`;
    markdown += `**Duration:** ${analysis.duration}  \n`;
    markdown += `**Messages:** ${analysis.messageCount}  \n`;
    const tokenUsage = analysis.tokenUsage || { input: 0, output: 0, cache: 0 };
    markdown += `**Tokens:** ${(tokenUsage.input + tokenUsage.output).toLocaleString()}  \n\n`;
    
    // Overview
    markdown += `## Overview\n\n`;
    markdown += `${this.generateTextSummary(analysis)}\n\n`;
    
    // Key Decisions
    if (analysis.keyDecisions.length > 0) {
      markdown += `## Key Decisions\n\n`;
      analysis.keyDecisions.forEach((decision: string, index: number) => {
        markdown += `${index + 1}. ${decision}\n`;
      });
      markdown += '\n';
    }
    
    // Solutions Implemented
    if (analysis.solutions.length > 0) {
      markdown += `## Solutions Implemented\n\n`;
      analysis.solutions.forEach((solution: string, index: number) => {
        markdown += `${index + 1}. ${solution}\n`;
      });
      markdown += '\n';
    }
    
    // Files Modified
    if (analysis.filesModified.length > 0) {
      markdown += `## Files Modified\n\n`;
      analysis.filesModified.forEach((file: string) => {
        markdown += `- \`${file}\`\n`;
      });
      markdown += '\n';
    }
    
    // Tools Used
    if (analysis.toolsUsed.length > 0) {
      markdown += `## Tools Used\n\n`;
      analysis.toolsUsed.forEach((tool: string) => {
        markdown += `- ${tool}\n`;
      });
      markdown += '\n';
    }
    
    // Topics Covered
    if (analysis.topics.length > 0) {
      markdown += `## Topics Covered\n\n`;
      analysis.topics.forEach((topic: string) => {
        markdown += `- ${topic}\n`;
      });
      markdown += '\n';
    }
    
    // Technical Details
    markdown += `## Technical Details\n\n`;
    markdown += `**Token Usage:**\n`;
    const tokenUsageMd = analysis.tokenUsage || { input: 0, output: 0, cache: 0 };
    markdown += `- Input: ${tokenUsageMd.input.toLocaleString()}\n`;
    markdown += `- Output: ${tokenUsageMd.output.toLocaleString()}\n`;
    markdown += `- Cache: ${tokenUsageMd.cache.toLocaleString()}\n\n`;
    
    if (analysis.codeLanguages.length > 0) {
      markdown += `**Programming Languages:** ${analysis.codeLanguages.join(', ')}\n\n`;
    }
    
    // Footer
    markdown += `---\n\n`;
    markdown += `*Generated by Claude Code History Viewer on ${date}*\n`;
    
    return markdown;
  }
}

export const summaryGenerator = new SummaryGenerator();