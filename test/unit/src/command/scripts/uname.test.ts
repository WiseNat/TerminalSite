import { describe, expect, test, vi } from "vitest";
import TerminalUtil from "../../../../../src/util/terminal_util.ts";
import UNAME from "../../../../../src/command/scripts/uname.ts";

describe("Hostname", () => {
  // Spy
  const appendOutput = vi.spyOn(TerminalUtil, "appendOutput");

  // Mock
  vi.mock("../../../../../src/util/terminal_util");

  // Other
  const kernelName = "Linux";
  const nodeName = "portfolio";
  const kernelRelease = "5.17.15-generic";
  const kernelVersion = "#1 PREEMPT Tue May 17 21:11:00 UTC 2022";
  const machine = "x86_64";
  const processor = "x86_64";
  const hardwarePlatform = "x86_64";
  const operatingSystem = "GNU/Linux";

  describe("run", () => {
    test("should output the kernel name when no arguments are provided", async () => {
      // Arrange
      const args: string[] = [];

      // Act
      await UNAME.run(args);

      // Assert
      expect(appendOutput).toHaveBeenCalledExactlyOnceWith(kernelName);
    });

    ["-a", "--all"].forEach((flag) => {
      test(`Given the ${flag}, should output all other flag contents in order`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(
          `${kernelName} ${nodeName} ${kernelRelease} ${kernelVersion} ${machine} ${processor} ${hardwarePlatform} ${operatingSystem}`,
        );
      });
    });

    ["-s", "--kernel-name"].forEach((flag) => {
      test(`Given the ${flag}, should output the kernel name`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(kernelName);
      });
    });

    ["-n", "--nodename"].forEach((flag) => {
      test(`Given the ${flag}, should output the node name`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(nodeName);
      });
    });

    ["-r", "--kernel-release"].forEach((flag) => {
      test(`Given the ${flag}, should output the kernel release`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(kernelRelease);
      });
    });

    ["-v", "--kernel-version"].forEach((flag) => {
      test(`Given the ${flag}, should output the kernel version`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(kernelVersion);
      });
    });

    ["-m", "--machine"].forEach((flag) => {
      test(`Given the ${flag}, should output the machine`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(machine);
      });
    });

    ["-p", "--processor"].forEach((flag) => {
      test(`Given the ${flag}, should output the processor`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(processor);
      });
    });

    ["-i", "--hardware-platform"].forEach((flag) => {
      test(`Given the ${flag}, should output the hardware platform`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(hardwarePlatform);
      });
    });

    ["-o", "--operating-system"].forEach((flag) => {
      test(`Given the ${flag}, should output the operating system`, async () => {
        // Arrange
        const args: string[] = [flag];

        // Act
        await UNAME.run(args);

        // Assert
        expect(appendOutput).toHaveBeenCalledExactlyOnceWith(operatingSystem);
      });
    });
  });
});
