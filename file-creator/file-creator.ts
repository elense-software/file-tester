import path from 'path'
import fs from 'fs'
import {FileData, TestFile} from "./concrete-creators/test-file";
import {HeaderRow} from "./concrete-creators/file-system-file-creator";

export interface FileCreatorConfiguration {
    headerRow: HeaderRow
}

export type SpreadsheetTypes = 'xlsx' | 'csv'

export interface FileCreator {
    create(fileName: string, fileData: FileData): Promise<TestFile>
    readFile(filePath: string | Buffer): TestFile
}

export class TestFilesDirectory {
    readonly directory: string
    constructor(basePath: string, readonly folder: string) {
        this.directory = path.resolve(basePath, this.folder)
    }

    create(): void {
        fs.mkdirSync(this.directory, {recursive: true})
    }

    clear(): void {
        if (fs.existsSync(this.directory)) {
            fs.rmSync(this.directory, {recursive: true})
        }
    }

    path(filePath: string) {
        return path.resolve(this.directory, filePath)
    }
}
