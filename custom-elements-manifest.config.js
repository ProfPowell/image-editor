export default {
  globs: ['src/image-editor.js'],
  exclude: ['dist', 'test', 'docs'],
  outdir: '.',
  litelement: false,
  plugins: [
    {
      name: 'strip-private',
      analyzePhase({ ts, node, moduleDoc }) {
        if (!moduleDoc?.declarations) return
        for (const decl of moduleDoc.declarations) {
          if (decl.members) {
            decl.members = decl.members.filter(
              (m) => !m.name?.startsWith('_') && !m.name?.startsWith('#')
            )
          }
        }
      }
    }
  ]
}
