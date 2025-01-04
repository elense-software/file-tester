import path from 'path'
import fs from 'fs'
import {HeaderRow} from "./concrete-creators/file-system-file-creator";

export interface FileCreatorConfiguration {
    headerRow: HeaderRow
}

export type SpreadsheetTypes = 'xlsx' | 'csv'

export interface FileCreator {
    create(fileName: string, fileData: any[][]): Promise<any[][]>
    readFile(filePath: string | Buffer): any[][]
}

export class TestFilesDirectory {
    readonly directory: string
    constructor(readonly basePath: string, readonly folder: string) {
        this.directory = path.resolve(this.basePath, this.folder)
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
