import { StaticTestFilesDirectory } from './static-test-files-directory';
import path from "path";

describe('Your file-based test', () => {
    // This is a helper class that provides a way to access files in a static folder
    const staticTestDir: StaticTestFilesDirectory = new StaticTestFilesDirectory(__dirname);

    it('Get file path from static folder', () => {
        const absoluteFilePath: string = staticTestDir.path('test-file.txt' )

        expect(absoluteFilePath).toBe(path.resolve(__dirname, 'static-test-files', 'test-file.txt'));
    });

    it('Read file from static folder', () => {
        const fileContent: string = staticTestDir.readFile('test-file.txt', 'utf8')

        expect(fileContent).toBe('Static test file.');
    });
});