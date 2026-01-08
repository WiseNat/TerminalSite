import { test } from "../../fixture";
import {
  assertOutputInTerminal,
  runCommand,
} from "../../helper/util/terminal_util.ts";

test.describe("Uname", () => {
  const kernelName = "Linux";
  const nodeName = "portfolio";
  const kernelRelease = "5.17.15-generic";
  const kernelVersion = "#1 PREEMPT Tue May 17 21:11:00 UTC 2022";
  const machine = "x86_64";
  const processor = "x86_64";
  const hardwarePlatform = "x86_64";
  const operatingSystem = "GNU/Linux";

  test("should output the kernel name without flags", async ({ page }) => {
    // Arrange
    const input = "uname";

    // Act
    await runCommand(page, input);

    // Assert
    await assertOutputInTerminal(page, `${input}\n${kernelName}`);
  });

  ["-a", "--all"].forEach((flag) => {
    test.describe(`all flag: ${flag}`, () => {
      test("should output all other flag contents in order", async ({
        page,
      }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(
          page,
          `${input}\n${kernelName} ${nodeName} ${kernelRelease} ${kernelVersion} ${machine} ${processor} ${hardwarePlatform} ${operatingSystem}`,
        );
      });
    });
  });

  ["-s", "--kernel-name"].forEach((flag) => {
    test.describe(`kernel name flag: ${flag}`, () => {
      test("should output the kernel name", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${kernelName}`);
      });
    });
  });

  ["-n", "--nodename"].forEach((flag) => {
    test.describe(`node name flag: ${flag}`, () => {
      test("should output the node name", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${nodeName}`);
      });
    });
  });

  ["-r", "--kernel-release"].forEach((flag) => {
    test.describe(`kernel release flag: ${flag}`, () => {
      test("should output the kernel release", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${kernelRelease}`);
      });
    });
  });

  ["-v", "--kernel-version"].forEach((flag) => {
    test.describe(`kernel version flag: ${flag}`, () => {
      test("should output the kernel version", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${kernelVersion}`);
      });
    });
  });

  ["-m", "--machine"].forEach((flag) => {
    test.describe(`machine flag: ${flag}`, () => {
      test("should output the machine", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${machine}`);
      });
    });
  });

  ["-p", "--processor"].forEach((flag) => {
    test.describe(`processor flag: ${flag}`, () => {
      test("should output the processor", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${processor}`);
      });
    });
  });

  ["-i", "--hardware-platform"].forEach((flag) => {
    test.describe(`hardware platform flag: ${flag}`, () => {
      test("should output the hardware platform", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${hardwarePlatform}`);
      });
    });
  });

  ["-o", "--operating-system"].forEach((flag) => {
    test.describe(`TODO flag: ${flag}`, () => {
      test("should output the TODO", async ({ page }) => {
        // Arrange
        const input = `uname ${flag}`;

        // Act
        await runCommand(page, input);

        // Assert
        await assertOutputInTerminal(page, `${input}\n${operatingSystem}`);
      });
    });
  });
});
