import crypto from 'crypto';
import MagicString from 'magic-string';
import { createFilter } from '@rollup/pluginutils';

function parseAttributes(attrString) {
	const reAttributes = /([\w\-]+)\s*=\s*(?:(?:(["'])((?:(?!\2).)*)\2)|([\w\-]+))|([\w\-]+)/g;

	let attributes = {},
			match      = null,
			attrName   = '',
			attrValue  = null;

	function camelCase(str) {
		return str.replace(/-([a-z])/g, function (_, letter) {
				return letter.toUpperCase();
		});
	}

	if (!attrString) {
		return attributes;
	}

	while (match = reAttributes.exec(attrString)) {
		attrName = match[1] || match[5];
		if (!attrName) { continue; }
		if (attrName.indexOf('-') !== -1) { attrName = camelCase(attrName); }
		if (attrName.toLowerCase() === 'editor') { attrName = 'editor'; }
		attrValue = match[3] || match[4] || true;
		attributes[attrName] = attrValue;
	}

	return attributes;
}

export default function editor(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'plugin-front-end-editor',
		enforce: 'pre',

    transform(code, id) {
      if (!filter(id)) return null;
      const ret = executeReplacement(code, id);
			return ret;
    }
  };

  function executeReplacement(code, id) {
    const magicString = new MagicString(code);
    if (!codeHasReplacements(code, id, magicString)) {
      return null;
    }

		console.log("\n\n\n", 'RESULT......', "\n\n\n\n", magicString.toString());

    const result = { code: magicString.toString() };
    if (isSourceMapEnabled()) {
      result.map = magicString.generateMap({ hires: true });
    }
    return result;
  }

  function codeHasReplacements(code, id, magicString) {
		const lines = code.split('\n');
		const hash = crypto.createHash('md5').update(code).digest('hex');
    let result = false;
		let editorBoundaries = [];
		let editorStart = -1;

		lines.forEach((line, lineNumber) => {
			if (line.toLowerCase().indexOf('(editor=') !== -1) {
				if (editorStart !== -1 || lineNumber === lines.length) {
					throw new Error('Missing editor end tag.');
				}

				editorStart = lineNumber;
			} else if (line.toLowerCase().indexOf('(editor)') !== -1) {
				editorBoundaries.push({ start: editorStart, end: lineNumber });
				editorStart = -1;
			}
		});

		editorBoundaries.forEach((boundary) => {
			const declaration = lines[boundary.start].substring(
				lines[boundary.start].indexOf('(') + 1, 
				lines[boundary.start].lastIndexOf(')')
			);
		  const attrs = parseAttributes(declaration);
			const startLength = lines.slice(0, boundary.start).join('\n').length;
			const endLength = lines.slice(0, boundary.end + 1).join('\n').length;
			let linesCopy = Array.from(lines);

			const scriptId = `editor-${hash}-${boundary.start}-${boundary.end}`;

			linesCopy[boundary.end] = '';
			linesCopy[boundary.start] = `
				<script type="module">
				import attachEditor from 'plugin-front-end-editor/src/myclient.js';

				document.addEventListener('DOMContentLoaded', function(){
					attachEditor({
						type: '${attrs.editor}',
						file: '${id}',
						hash: '${hash}',
						boundary: {
							start: ${boundary.start},
							end: ${boundary.end},
						},
						scriptId: '${scriptId}',
						elementId: '${attrs.elementId}',
					});
				});
				</script>
				<script id="${scriptId}"></script>
			`.replace(/\t/g, '').replace(/\r?\n|\r/g, ' ');

      magicString.overwrite(startLength, endLength, linesCopy.slice(boundary.start, boundary.end + 1).join('\n'));

      result = true;
		});

    return result;
  }

  function isSourceMapEnabled() {
    return options.sourceMap !== false && options.sourcemap !== false;
  }
}
