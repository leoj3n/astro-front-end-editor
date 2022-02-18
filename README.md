# Astro Front End Editor

Comments in source files like `<!-- (EDITOR="code" lang="html") -->`:

```html
<!-- (editor="textarea" maxlength="50") -->
Hello, React!!!
<!-- (editor) -->
```

```html
<!-- (EDITOR="code" lang="html") -->
<div class="pink-bg black-border small-width">
	<h6>A Heading</h6>
	<p>Some content</p>
</div>
<!-- (EDITOR) -->
```

Become injected edit buttons:

<img width="791" alt="image" src="https://user-images.githubusercontent.com/990216/154728921-b3c4ce7d-dadc-43e2-814e-72710b347bcb.png">

When clicked these will be made to open a simple textarea, code editor, or whatever other kind of "editor" as specified by `EDITOR="editor type here"` that saves back to that same location in the file thanks to this line mapping injected into the front end:

```html
<script type="text/javascript" id="editor-for-lines-64-68">
document.addEventListener('DOMContentLoaded', function() {
    attachEditor({
        type: 'code',
        file: '/Users/leoj/src/wip/astro/astro-front-end-editor/demo/src/pages/index.astro',
        hash: '3dc47b1cc774bf1e1cc59e69b5792878',
        boundary: {
            start: 64,
            end: 68,
        },
        scriptId: 'editor-for-lines-64-68',
    });
});
</script>
```

Injected buttons with line mappings are working.

@TODO next is to have a "textarea" editor connect to backend server to pull file contents at specified line number, and replace with changes upon user save from front end.

Relevant files to check out:

  - https://github.com/leoj3n/astro-front-end-editor/blob/main/demo/astro.config.js#L6-L25
  - https://github.com/leoj3n/astro-front-end-editor/blob/main/demo/src/pages/index.astro#L47-L85
  - https://github.com/leoj3n/astro-front-end-editor/blob/main/packages/plugin-front-end-editor/src/index.js#L177-L222
    - This is where the rollup plugin hooks in before astro plugins to find instances of `(editor=` and `(editor)` which mark "edit boundaries".
    - The boundary line numbers are sent to the front end by replacing the `editor=` comment with a `<script>` with that info pasted in.
    - Also pasted into the script tag is an md5 hash of the code file contents. This will be used by the front end editor to verify line numbers will be in the correct place (i.e. the file hasn't changed in the backend since this instance of front end injection).
    - `magicString.overwrite` replaces the original source file contents in the determined line range with this script tag while replacing the first editor comment and removing the last.
      - `magicString` also generates a source map for the changes. I am not sure if this is necessary?
      - `magicString` was used in the rollup plugin this project was based off of:
        -  https://github.com/rollup/plugins/tree/master/packages/replace

Note this hack using npm postinstall until [PR for config callback](https://github.com/withastro/astro/pull/2611) is approved/merged:

  - https://github.com/leoj3n/astro-front-end-editor/blob/main/package.json#L17

<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

## Astro Starter Kit: Plugin (save here for reference)

```shell
npm init astro -- --template astro-community/plugin-template
```

[![Open in StackBlitz][open-img]][open-url]



## Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── demo/
│   ├── public/
│   └── src/
│       └── pages/
│           └── index.astro
└── packages/
    └── my-plugin/
        ├── index.js
        └── package.json
```

This project uses **workspaces** to develop a single package, `@example/my-plugin`.

It also includes a minimal Astro project, `demo`, for developing and demonstrating the plugin.



## Commands

All commands are run from the root of the project, from a terminal:

| Command         | Action                                       |
|:----------------|:---------------------------------------------|
| `npm install`   | Installs dependencies                        |
| `npm run start` | Starts local dev server at `localhost:3000`  |
| `npm run build` | Build your production site to `./dist/`      |
| `npm run serve` | Preview your build locally, before deploying |

Want to learn more?
Read [our documentation][docs-url] or jump into our [Discord server][chat-url].



[chat-url]: https://astro.build/chat
[docs-url]: https://github.com/withastro/astro
[open-img]: https://developer.stackblitz.com/img/open_in_stackblitz.svg
[open-url]: https://stackblitz.com/github/withastro/astro/tree/latest/examples/plugin
