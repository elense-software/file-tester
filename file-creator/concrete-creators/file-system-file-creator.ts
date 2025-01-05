import {dirname} from 'path'
import fs from 'fs'
import {FileCreator, FileCreatorConfiguration} from "../file-creator";
import {FileData, TestFile} from "./test-file";
import {SpreadsheetTestFile} from "./spreadsheet-test-file";

export type HeaderRow = string[] | null

export class FileSystemFileCreator implements FileCreator {
    constructor(readonly configuration: FileCreatorConfiguration) {}

    async create(filePath: string, fileData: FileData): Promise<TestFile> {
        this.writeFile(fileData, filePath, this.configuration.headerRow)
        return this.readFile(filePath)
    }

    readFile(filePath: string | Buffer): TestFile {
        return SpreadsheetTestFile.get(filePath)
    }

    private writeFile(fileData: FileData, filePath: string, headerRow?: HeaderRow) {
        const file = new SpreadsheetTestFile(
            fileData,
            filePath
        )

        file.write(filePath, headerRow)
    }
}
