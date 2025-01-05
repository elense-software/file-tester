import fs from "fs";
import * as path from 'path'

export class TestFilesDirectory {
    static globalDirectoryPathComponent = '_test-runtime'

    readonly directory: string

    constructor(basePath: string, readonly folder: string) {
        this.directory = path.resolve(basePath, TestFilesDirectory.globalDirectoryPathComponent, this.folder)
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