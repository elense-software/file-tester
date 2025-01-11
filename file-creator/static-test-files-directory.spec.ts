import { StaticTestFilesDirectory } from './static-test-files-directory';
import fs from "fs";
import path from "path";

describe('StaticTestFilesDirectory', () => {
    let staticTestDir: StaticTestFilesDirectory;

    beforeEach(() => {
        staticTestDir = new StaticTestFilesDirectory(__dirname);
    });

    it('creates the static test files directory successfully', () => {
        staticTestDir.create();
        expect(fs.existsSync(staticTestDir.directory)).toBe(true);
    });

    it('clears the static test files directory successfully', () => {
        staticTestDir.create();
        staticTestDir.clear();
        expect(fs.existsSync(staticTestDir.directory)).toBe(false);
    });

    it('returns the correct path for a file in the static test files directory', () => {
        const filePath = 'file.txt';
        const expectedPath = path.resolve(__dirname, 'static-test-files', filePath);
        expect(staticTestDir.path(filePath)).toBe(expectedPath);
    });

    it('handles creating an already existing static test files directory gracefully', () => {
        staticTestDir.create();
        expect(() => staticTestDir.create()).not.toThrow();
    });

    it('handles clearing a non-existent static test files directory gracefully', () => {
        expect(() => staticTestDir.clear()).not.toThrow();
    });

    it('creates the static test files directory with a custom folder name successfully', () => {
        const customDir = new StaticTestFilesDirectory(__dirname, 'custom-folder');
        customDir.create();
        expect(fs.existsSync(customDir.directory)).toBe(true);
    });

    it('handles multilevel static test files directory successfully', () => {
        const nested = new StaticTestFilesDirectory(staticTestDir.directory, 'nested/subnested');
        nested.create();
        expect(fs.existsSync(nested.directory)).toBe(true);
    });
});