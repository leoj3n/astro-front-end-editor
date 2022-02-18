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
      return executeReplacement(code, id);
    }
  };

  function executeReplacement(code, id) {
    const magicString = new MagicString(code);
    if (!codeHasReplacements(code, id, magicString)) {
      return null;
    } else {
			magicString.appendLeft(code.indexOf('</head>'), `
				<script type="text/javascript">
				const styleToAdd = \`
				<style type="text/css">
				.editorReset {
				  background: none;
					border: none;
					bottom: auto;
					box-shadow: none;
					color: black;
					cursor: auto;
					display: inline;
					float: none;
					font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
					font-size: inherit;
					font-style: normal;
					font-variant: normal;
					font-weight: normal;
					height: auto;
					left: auto;
					letter-spacing: 0;
					line-height: 100%;
					margin: 0;
					max-height: none;
					max-width: none;
					min-height: 0;
					min-width: 0;
					opacity: 1;
					padding: 0;
					position: static;
					right: auto;
					text-align: left;
					text-decoration: none;
					text-indent: 0;
					text-shadow: none;
					text-transform: none;
					top: auto;
					vertical-align: baseline;
					white-space: normal;
					width: auto;
					z-index: 2140000000;
				}
				.editorHintMarker {
					cursor: pointer;
					position: absolute;
					display: block;
					top: -1px;
					left: -1px;
					white-space: nowrap;
					overflow: hidden;
					font-size: 11px;
					padding: 1px 3px 0px 3px;
					background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#FFF785), color-stop(100%,#FFC542));
					border: solid 1px #C38A22;
					border-radius: 3px;
					box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.3);
				}
				</style>\`;
				document.head.insertAdjacentHTML('beforeend', styleToAdd)
				</script>
			  <script type="text/javascript">
					function addElementList(els, overlayOptions) {
						const parent = this.createElement('div');
						if (overlayOptions.id != null) { parent.id = overlayOptions.id; }
						if (overlayOptions.className != null) { parent.className = overlayOptions.className; }
						for (let el of els) { parent.appendChild(el); }

						document.documentElement.appendChild(parent);
						return parent;
					}

					function createElement(tagName) {
						const element = document.createElement(tagName);
						if (element instanceof HTMLElement) {
							this.createElement = tagName => document.createElement(tagName);
							return element;
						} else {
							this.createElement = tagName => document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
							return this.createElement(tagName);
						}
					}

					let editorMarkers = [];

					function attachEditor(opts) {
						console.log('EDITOR ATTACH', opts);

						let attachToEl = document.getElementById(opts.scriptId);
						attachToEl = attachToEl.nextElementSibling || attachToEl.parentElement;
						if (opts.elementId !== 'undefined') { attachToEl = document.getElementById(opts.elementId); }

						const el = createElement('div');
						el.textContent = 'Edit';
						el.rect = attachToEl.getBoundingClientRect();
						el.style.left = el.rect.left + 'px';
						el.style.top = el.rect.top  + 'px';
						el.className = 'editorReset editorHintMarker';
						editorMarkers.push(el);
					}
					window.addEventListener('load', function(){
						let editorMarkerContainingDiv = addElementList(
							editorMarkers,
							{id: 'editorHintMarkerContainer', className: 'editorReset'});
					});
			  </script>
			`);
		}

		console.log(magicString.toString());

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

			const scriptId = `editor-for-lines-${boundary.start}-${boundary.end}`;

			linesCopy[boundary.end] = '';
			linesCopy[boundary.start] = `
				<script type="text/javascript" id="${scriptId}">
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
				</script>`.replace(/\t/g, '').replace(/\r?\n|\r/g, ' ');

      magicString.overwrite(startLength, endLength, linesCopy.slice(boundary.start, boundary.end + 1).join('\n'));

      result = true;
		});

    return result;
  }

  function isSourceMapEnabled() {
    return options.sourceMap !== false && options.sourcemap !== false;
  }
}
