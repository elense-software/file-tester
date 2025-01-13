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

    it('Read file from static folder with validation passes', () => {
        const staticTestDir: StaticTestFilesDirectory = new StaticTestFilesDirectory(
            __dirname,
            `${StaticTestFilesDirectory.defaultFolderName}/csv`,
            (filePath: string) => {
                if (!filePath.endsWith('.csv')) {
                    throw new Error(`File ${filePath} is not a CSV file.`);
                }
            });

        const fileContent: string = staticTestDir.readFile('test-file.csv', 'utf8')

        expect(fileContent).toBe('Name,Last name,Age');
    });

    it('Read file from static folder throws when validator fails', () => {
        expect(() => {
            const staticTestDir: StaticTestFilesDirectory = new StaticTestFilesDirectory(
                __dirname,
                `${StaticTestFilesDirectory.defaultFolderName}/csv`,
                (filePath: string) => {
                    if (!filePath.endsWith('.xlsx')) {
                        throw new Error(`File ${filePath} is not a XLSX file.`);
                    }
                });
        }).toThrow(`test-file.csv`)
    });
});