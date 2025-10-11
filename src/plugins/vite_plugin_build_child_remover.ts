import { Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

/**
 * Vite plugin that removes the `directories` and any files with an extension
 * in `extensions` from the final production build.
 *
 * @param directories list of directories to remove, relative to the build folder.
 * @param extensions list of file extensions for files that should be removed.
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export default function BuildFileRemover(
  directories: string[],
  extensions: string[],
): Plugin {
  const name = "build-child-remover";
  const virtualModuleId = `virtual:${name}`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: `vite-plugin-${name}`,
    apply: "build",

    resolveId(source) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    writeBundle(outputOptions) {
      const outputDir = outputOptions.dir;

      if (outputDir === undefined) {
        return;
      }

      for (const directory of directories) {
        fs.rm(
          path.resolve(outputDir, directory),
          { recursive: true },
          () => {},
        );
      }

      const walk = (dir: string) => {
        for (const file of fs.readdirSync(dir)) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            walk(filePath);
          } else if (extensions.some((ext) => filePath.endsWith(ext))) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file from dist: ${filePath}`);
          }
        }
      };

      walk(outputDir);
    },
  };
}
