import { TestFilesDirectory } from './test-files-directory';
import fs from 'fs';
import path from 'path';
import {StaticTestFilesDirectory} from "./static-test-files-directory";
import {RuntimeTestFilesDirectory} from "./runtime-test-files-directory";

describe('TestFilesDirectory', () => {
    let testDir: TestFilesDirectory;

    beforeEach(() => {
        testDir = new TestFilesDirectory(__dirname);
    });

    it('creates the directory successfully', () => {
        testDir.create();
        expect(fs.existsSync(testDir.directory)).toBe(true);
    });

    it('clears the directory successfully', () => {
        testDir.create();
        testDir.clear();
        expect(fs.existsSync(testDir.directory)).toBe(false);
    });

    it('Sets up path with default folder name', () => {
        const dir: TestFilesDirectory = new TestFilesDirectory(__dirname);

        dir.reset()

        const expectedPath = path.resolve(__dirname, 'test-files');
        expect(fs.existsSync(expectedPath)).toBe(true);
    });

    it('Sets up path with custom folder name', () => {
        const dir: TestFilesDirectory = new TestFilesDirectory(__dirname, 'custom-folder');

        dir.reset()

        const expectedPath = path.resolve(__dirname, 'custom-folder');
        expect(fs.existsSync(expectedPath)).toBe(true);
    });

    it('Sets up path in default folder but with custom folder name', () => {
        const defaultDir: TestFilesDirectory = new TestFilesDirectory(__dirname);
        const customDir: TestFilesDirectory = new TestFilesDirectory(__dirname, 'custom-folder');
        const defaultDirWithCustomFolder: TestFilesDirectory = new TestFilesDirectory(`${__dirname}/${TestFilesDirectory.defaultFolderName}`, `custom-folder`);

        defaultDir.reset()                      // clears and creates relative ./test-files folder
        customDir.reset()                       // clears and creates relative ./custom-folder
        defaultDirWithCustomFolder.reset()      // clears and creates relative ./test-files/custom-folder

        const expectedPath = path.resolve(__dirname, 'custom-folder');
        expect(fs.existsSync(expectedPath)).toBe(true);
    });

    it('Minimal use', () => {
        const defaultDir: TestFilesDirectory = new TestFilesDirectory(__dirname);

        defaultDir.reset() // clears and creates relative ./test-files folder

        const testFilePath = defaultDir.path('file.txt') // returns path to file.txt in ./test-files

        fs.writeFileSync(testFilePath, 'test')
        const file = fs.readFileSync(testFilePath, 'utf8')

        expect(file).toBe('test');
    });

    it('Load static file, save updated and assert on', () => {
        const staticDir: StaticTestFilesDirectory = new StaticTestFilesDirectory(__dirname)
        const testSentenceFile = staticDir.readFile('test-sentence.txt', 'utf8')

        expect(testSentenceFile).toEqual("This is a test sentence.")

        const updatedFileContent = testSentenceFile + " Updated!"

        const runtimeDir: RuntimeTestFilesDirectory = new RuntimeTestFilesDirectory(__dirname)
        runtimeDir.writeFile('test-sentence-updated.txt', updatedFileContent)

        const updatedFile = runtimeDir.readFile('test-sentence-updated.txt', 'utf8')
        expect(updatedFile).toBe('This is a test sentence. Updated!');
    });

    it('returns the correct path for a file', () => {
        const filePath = 'file.txt';
        const expectedPath = path.resolve(__dirname, 'test-files', filePath);
        expect(testDir.path(filePath)).toBe(expectedPath);
    });

    it('handles creating an already existing directory gracefully', () => {
        testDir.create();
        expect(() => testDir.create()).not.toThrow();
    });

    it('handles clearing a non-existent directory gracefully', () => {
        expect(() => testDir.clear()).not.toThrow();
    });

    it('creates the directory successfully', () => {
        testDir.create();
        expect(fs.existsSync(testDir.directory)).toBe(true);
    });

    it('handles multilevel directory successfully', () => {
        const nested: TestFilesDirectory = new TestFilesDirectory(testDir.directory, `${TestFilesDirectory.defaultFolderName}/nested/subnested`);
        nested.create()

        expect(fs.existsSync(nested.directory)).toBe(true);
    });

    it('handles multilevel directory successfully', () => {
        testDir.create()
        const nested: TestFilesDirectory = new TestFilesDirectory(testDir.directory, `${TestFilesDirectory.defaultFolderName}/branched/nested`      );
        nested.create()

        expect(fs.existsSync(nested.directory)).toBe(true);
    });
});