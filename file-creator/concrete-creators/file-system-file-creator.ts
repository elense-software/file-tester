import {FileCreator} from "../file-creator";
import {FileData, TestFile} from "./test-file";
import {SpreadsheetTestFile} from "./spreadsheet-test-file";

export type HeaderRow = string[] | null

export class FileSystemFileCreator implements FileCreator {
    constructor() {}

    async create(filePath: string, fileData: FileData): Promise<TestFile> {
        this.writeFile(fileData, filePath)
        return this.readFile(filePath)
    }

    readFile(filePath: string | Buffer): TestFile {
        return SpreadsheetTestFile.get(filePath)
    }

    private writeFile(fileData: FileData, filePath: string) {
        const file = new SpreadsheetTestFile(
            fileData,
            filePath
        )

        file.write(filePath)
    }
}
