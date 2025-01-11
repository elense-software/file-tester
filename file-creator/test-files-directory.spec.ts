import { TestFilesDirectory } from './test-files-directory';
import fs from 'fs';
import path from 'path';

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