import fs from "fs";
import * as path from 'path'

export class TestFilesDirectory {
    static defaultFolderName = 'test-files'

    static async runInDirectory(
        basePath: string,
        folder: string = TestFilesDirectory.defaultFolderName,
        callback: (dir: TestFilesDirectory) => Promise<void>) {
        const testDirectory = new TestFilesDirectory(basePath, folder)

        await callback(testDirectory)
    }

    readonly directory: string

    constructor(basePath: string, folder: string = TestFilesDirectory.defaultFolderName) {
        this.directory = path.resolve(basePath, folder)
    }

    create(): void {
        fs.mkdirSync(this.directory, {recursive: true})
    }

    clear(): void {
        if (fs.existsSync(this.directory)) {
            fs.rmSync(this.directory, {recursive: true})
        }
    }

    path(filePath: string, filePathTransformationStrategy: FilePathGenerationStrategy = new ExactFilePathGenerationStrategy()): string {
        const finalFilePath: string = filePathTransformationStrategy.generate(filePath)

        return path.resolve(this.directory, finalFilePath)
    }
}

export interface FilePathGenerationStrategy {
    generate(filePath: string): string
}

export class ExactFilePathGenerationStrategy implements FilePathGenerationStrategy {
    generate(filePath: string): string {
        return filePath
    }
}
