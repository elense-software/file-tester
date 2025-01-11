import { RuntimeTestFilesDirectory } from './runtime-test-files-directory';
import fs from "fs";
import path from "path";

describe('RuntimeTestFilesDirectory', () => {
    let runtimeTestDir: RuntimeTestFilesDirectory;

    let basePath = __dirname;
    beforeEach(() => {
        runtimeTestDir = new RuntimeTestFilesDirectory(basePath);
    });

    it('creates the runtime test files directory successfully', () => {
        runtimeTestDir.create();
        expect(fs.existsSync(runtimeTestDir.directory)).toBe(true);
    });

    it('clears the runtime test files directory successfully', () => {
        runtimeTestDir.create();
        runtimeTestDir.clear();
        expect(fs.existsSync(runtimeTestDir.directory)).toBe(false);
    });

    it('returns the correct path for a file in the runtime test files directory', () => {
        const filePath = 'file.txt';
        const expectedPath = path.resolve(basePath, 'runtime-test-files', filePath);
        expect(runtimeTestDir.path(filePath)).toBe(expectedPath);
    });

    it('handles creating an already existing runtime test files directory gracefully', () => {
        runtimeTestDir.create();
        expect(() => runtimeTestDir.create()).not.toThrow();
    });

    it('handles clearing a non-existent runtime test files directory gracefully', () => {
        expect(() => runtimeTestDir.clear()).not.toThrow();
    });

    it('creates the runtime test files directory with a custom folder name successfully', () => {
        const customDir = new RuntimeTestFilesDirectory(basePath, 'custom-runtime-folder');
        customDir.create();
        expect(fs.existsSync(customDir.directory)).toBe(true);
    });

    it('handles multilevel runtime test files directory successfully', () => {
        const nested = new RuntimeTestFilesDirectory(runtimeTestDir.directory, 'nested/subnested');
        nested.create();
        expect(fs.existsSync(nested.directory)).toBe(true);
    });
});