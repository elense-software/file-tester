import { RuntimeTestFilesDirectory } from './runtime-test-files-directory';
import fs from "fs";
import path from "path";

describe('RuntimeTestFilesDirectory', () => {
    const runtimeTestDir: RuntimeTestFilesDirectory = new RuntimeTestFilesDirectory(__dirname);

    beforeEach(() => {
        runtimeTestDir.reset()
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
        const expectedPath = path.resolve(__dirname, 'runtime-test-files', filePath);
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
        const customDir = new RuntimeTestFilesDirectory(__dirname, 'custom-runtime-folder');
        customDir.create();
        expect(fs.existsSync(customDir.directory)).toBe(true);
    });

    it('handles multilevel runtime test files directory successfully', () => {
        const nested = new RuntimeTestFilesDirectory(runtimeTestDir.directory, 'nested/subnested');
        nested.create();
        expect(fs.existsSync(nested.directory)).toBe(true);
    });
});

describe('Your test which generates files dynamically in runtime', () => {
    const runtimeTestDir: RuntimeTestFilesDirectory = new RuntimeTestFilesDirectory(__dirname);

    beforeAll(() => {
        // Resetting the dir only once so that you can view the files during tests debug
        runtimeTestDir.reset()
    });

    it('Writes file.txt, reads it and verifies contents', () => {
        const fileContent = "Runtime test file content"

        runtimeTestDir.writeFile('file.txt', fileContent)

        const savedFile = runtimeTestDir.readFile('file.txt', 'utf8')

        expect(savedFile).toEqual(fileContent);
    });

    it('Provides path to files but let you write and read on your own', () => {
        const filePath = runtimeTestDir.path('another-file.csv');

        fs.writeFileSync(filePath, 'Name,LastName,Age\nRadek,Landowski,22')
        const fileContent = fs.readFileSync(filePath, 'utf8')

        expect(fileContent).toEqual('Name,LastName,Age\nRadek,Landowski,22');
    });
});