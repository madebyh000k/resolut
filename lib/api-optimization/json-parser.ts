/**
 * Robust JSON Parser for Claude API Responses
 * Handles various markdown code fence formats and extracts clean JSON
 */

/**
 * Comprehensive JSON validation and fixing
 * Tries multiple fix strategies before giving up
 */
function validateAndFixJSON(jsonStr: string): any {
  // Try to parse as-is first
  try {
    console.log('[JSON Parser] Attempting JSON.parse...');
    return JSON.parse(jsonStr);
  } catch (firstError) {
    console.error('[JSON Parser] ❌ Initial parse failed:', firstError instanceof Error ? firstError.message : String(firstError));

    // Extract position from error message if available
    const positionMatch = firstError instanceof Error ? firstError.message.match(/position (\d+)/) : null;
    if (positionMatch) {
      const errorPos = parseInt(positionMatch[1]);
      const start = Math.max(0, errorPos - 200);
      const end = Math.min(jsonStr.length, errorPos + 200);
      const context = jsonStr.substring(start, end);
      const markerPos = errorPos - start;

      console.error('[JSON Parser] ===== ERROR CONTEXT =====');
      console.error('[JSON Parser] Error at position:', errorPos);
      console.error('[JSON Parser] Context (±200 chars):');
      console.error(context.substring(0, markerPos) + ' <<<ERROR HERE>>> ' + context.substring(markerPos));
      console.error('[JSON Parser] ===== END ERROR CONTEXT =====');
    }

    console.error('[JSON Parser] Attempting common JSON fixes...');

    // Define fix strategies
    const fixes: Array<{ name: string; fn: (str: string) => string }> = [
      {
        name: 'Remove trailing commas',
        fn: (str) => str.replace(/,(\s*[}\]])/g, '$1'),
      },
      {
        name: 'Remove control characters (except tab/newline)',
        fn: (str) => str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ''),
      },
      {
        name: 'Fix single-quoted property names',
        fn: (str) => str.replace(/'([^']+)'(\s*:)/g, '"$1"$2'),
      },
      {
        name: 'Fix unquoted property names',
        fn: (str) => str.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3'),
      },
      {
        name: 'Escape unescaped quotes in string values',
        fn: (str) => {
          // Find all strings and escape internal quotes
          return str.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match) => {
            // Don't modify if already properly escaped
            if (!match.includes('\\"')) {
              return match.replace(/"/g, (q, offset) => {
                // Don't escape first and last quote
                if (offset === 0 || offset === match.length - 1) return q;
                return '\\"';
              });
            }
            return match;
          });
        },
      },
      {
        name: 'Fix missing commas between array elements',
        fn: (str) => str.replace(/("\s*)\n(\s*")/g, '$1,\n$2'),
      },
      {
        name: 'Remove JavaScript comments',
        fn: (str) => str.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''),
      },
      {
        name: 'Fix literal newlines in string values',
        fn: (str) => {
          // Replace unescaped newlines within strings
          return str.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
          });
        },
      },
      {
        name: 'Combined: basic fixes',
        fn: (str) => str
          .replace(/,(\s*[}\]])/g, '$1') // trailing commas
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ''), // control chars
      },
      {
        name: 'Combined: property name fixes',
        fn: (str) => str
          .replace(/'([^']+)'(\s*:)/g, '"$1"$2') // single quotes to double
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3') // unquoted to quoted
          .replace(/,(\s*[}\]])/g, '$1'), // trailing commas
      },
      {
        name: 'Combined: ALL aggressive fixes',
        fn: (str) => {
          let fixed = str;
          // 1. Remove control characters
          fixed = fixed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
          // 2. Remove comments
          fixed = fixed.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
          // 3. Fix property names
          fixed = fixed.replace(/'([^']+)'(\s*:)/g, '"$1"$2');
          fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3');
          // 4. Fix trailing commas
          fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
          // 5. Fix missing commas
          fixed = fixed.replace(/("\s*)\n(\s*")/g, '$1,\n$2');
          // 6. Fix newlines in strings
          fixed = fixed.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
          });
          return fixed;
        },
      },
    ];

    // Try each fix
    for (let i = 0; i < fixes.length; i++) {
      try {
        console.error(`[JSON Parser] Trying fix #${i + 1}: ${fixes[i].name}...`);
        const fixed = fixes[i].fn(jsonStr);
        const parsed = JSON.parse(fixed);
        console.error(`[JSON Parser] ✅ Fix #${i + 1} worked: ${fixes[i].name}!`);
        return parsed;
      } catch (e) {
        console.error(`[JSON Parser] ❌ Fix #${i + 1} didn't work:`, e instanceof Error ? e.message : String(e));
      }
    }

    // NUCLEAR OPTION: Try to salvage whatever JSON we can find
    console.error('[JSON Parser] ⚠️ Attempting NUCLEAR JSON extraction...');
    try {
      // Try to find the main JSON object boundaries
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        let extracted = jsonStr.substring(firstBrace, lastBrace + 1);
        console.error('[JSON Parser] Nuclear: Extracted JSON boundaries');

        // Apply all aggressive fixes to the extracted portion
        extracted = extracted
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // control chars
          .replace(/\/\/.*$/gm, '') // comments
          .replace(/'([^']+)'(\s*:)/g, '"$1"$2') // single-quoted props
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '$1"$2"$3') // unquoted props
          .replace(/,(\s*[}\]])/g, '$1') // trailing commas
          .replace(/("\s*)\n(\s*")/g, '$1,\n$2'); // missing commas

        // Try to fix unterminated strings by finding and closing them
        const stringMatches = [...extracted.matchAll(/"([^"]*)$/gm)];
        if (stringMatches.length > 0) {
          console.error('[JSON Parser] Nuclear: Found unterminated strings, attempting fix');
          extracted = extracted.replace(/"([^"]*)$/gm, '"$1"');
        }

        const nuclearParsed = JSON.parse(extracted);
        console.error('[JSON Parser] ✅ NUCLEAR extraction worked!');
        return nuclearParsed;
      }
    } catch (nuclearError) {
      console.error('[JSON Parser] ❌ Nuclear extraction failed:', nuclearError instanceof Error ? nuclearError.message : String(nuclearError));
    }

    // If all fixes fail, show detailed breakdown
    console.error('[JSON Parser] ===== FULL JSON VALIDATION BREAKDOWN =====');
    console.error('[JSON Parser] Length:', jsonStr.length);
    console.error('[JSON Parser] First 500 chars:', jsonStr.substring(0, 500));
    console.error('[JSON Parser] Last 500 chars:', jsonStr.substring(jsonStr.length - 500));

    // Find all bracket/brace pairs
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;

    console.error('[JSON Parser] Bracket balance:');
    console.error(`[JSON Parser]   [ count: ${openBrackets}  ] count: ${closeBrackets}  Diff: ${openBrackets - closeBrackets}`);
    console.error(`[JSON Parser]   { count: ${openBraces}  } count: ${closeBraces}  Diff: ${openBraces - closeBraces}`);

    // Save to temp file for manual inspection
    try {
      const fs = require('fs');
      const timestamp = Date.now();
      const filepath = `/tmp/failed-json-${timestamp}.txt`;
      fs.writeFileSync(filepath, jsonStr);
      console.error(`[JSON Parser] 💾 Saved full JSON to: ${filepath}`);
      console.error('[JSON Parser] ===== END VALIDATION BREAKDOWN =====');
    } catch (fsError) {
      console.error('[JSON Parser] Could not save to file:', fsError);
    }

    throw new Error(`JSON validation failed after trying all fixes including nuclear option. ${firstError instanceof Error ? firstError.message : 'Unknown error'}`);
  }
}

/**
 * Extract and parse JSON from Claude API response text
 * Handles:
 * - ```json ... ```
 * - ``` ... ```
 * - ```JSON ... ```
 * - Plain JSON without markdown
 * - Extra whitespace
 */
export function parseClaudeJsonResponse<T = any>(responseText: string): T {
  console.log('[JSON Parser] Starting parse...');
  console.log('[JSON Parser] Input length:', responseText.length);
  console.log('[JSON Parser] First 200 chars:', responseText.substring(0, 200));
  console.log('[JSON Parser] Last 200 chars:', responseText.substring(responseText.length - 200));

  let jsonStr = responseText.trim();

  // Check if it starts with markdown fence
  const startsWithFence = jsonStr.startsWith('```');
  console.log('[JSON Parser] Starts with markdown fence:', startsWithFence);

  // Step 1: Remove markdown code fences if present
  const codeBlockRegex = /```(?:json|JSON)?\s*\n?([\s\S]*?)\n?\s*```/gi;

  if (codeBlockRegex.test(jsonStr)) {
    console.log('[JSON Parser] Markdown fence detected, extracting...');
    // Reset regex (because test() moves the index)
    codeBlockRegex.lastIndex = 0;
    const match = codeBlockRegex.exec(jsonStr);
    if (match && match[1]) {
      jsonStr = match[1].trim();
      console.log('[JSON Parser] After fence removal, length:', jsonStr.length);
      console.log('[JSON Parser] After fence removal, first 200 chars:', jsonStr.substring(0, 200));
    }
  } else {
    console.log('[JSON Parser] No markdown fence detected (or regex did not match)');
  }

  // Step 2: Remove any remaining backticks
  jsonStr = jsonStr.replace(/^`+|`+$/g, '').trim();

  // Step 3: Remove leading "json" or "JSON" text if it appears before the actual JSON
  // Example: "json { ... }" becomes "{ ... }"
  const beforeRemovingJson = jsonStr;
  jsonStr = jsonStr.replace(/^\s*(?:json|JSON)\s+/, '').trim();
  if (beforeRemovingJson !== jsonStr) {
    console.log('[JSON Parser] Removed leading "json" prefix');
  }

  // Step 4: Find and extract the actual JSON object (starts with { or [)
  // This handles cases where there's extra text before or after the JSON
  const jsonObjectMatch = jsonStr.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonObjectMatch) {
    const extracted = jsonObjectMatch[1];
    if (extracted !== jsonStr) {
      console.log('[JSON Parser] Extracted JSON object from surrounding text');
      console.log('[JSON Parser] Before extraction:', jsonStr.substring(0, 100));
      jsonStr = extracted.trim();
    }
  }

  console.log('[JSON Parser] After all cleanup, length:', jsonStr.length);
  console.log('[JSON Parser] Final JSON first 300 chars:', jsonStr.substring(0, 300));

  // Parse with comprehensive validation and fixes
  try {
    const parsed = validateAndFixJSON(jsonStr);
    console.log('[JSON Parser] ✅ Successfully parsed JSON');
    console.log('[JSON Parser] Parsed object keys:', Object.keys(parsed as any).join(', '));
    return parsed as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON from Claude response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate that a parsed object has required properties
 */
export function validateRequiredFields<T extends object>(
  obj: T,
  requiredFields: (keyof T)[],
  entityName: string = 'response'
): void {
  const missingFields = requiredFields.filter(field => obj[field] === undefined || obj[field] === null);

  if (missingFields.length > 0) {
    console.error(`[JSON Parser] Missing required fields in ${entityName}:`, missingFields);
    console.error('[JSON Parser] Received object:', obj);
    throw new Error(
      `Invalid ${entityName} structure: missing fields [${missingFields.join(', ')}]`
    );
  }
}
