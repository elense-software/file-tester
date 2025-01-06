import {FileSpecs, TestFile} from "./test-file";
import fs from "fs";
import * as XLSX from "xlsx";
import {dirname, extname} from "path";

export type SpreadsheetFileData = any[][]

export class SpreadsheetTestFile<T extends SpreadsheetFileData = SpreadsheetFileData, R extends string[] = string[]> implements TestFile<T> {
    static get<T extends SpreadsheetFileData, R extends string[] = string[]>(path: string | Buffer, fileSpecs?: FileSpecs<R>): SpreadsheetTestFile<T> {
        let fileBuffer: Buffer

        let filePath: string | null = null
        if (Buffer.isBuffer(path)) {
            fileBuffer = path
        } else {
            fileBuffer = fs.readFileSync(path)
            filePath = path
        }

        const workbook = XLSX.read(fileBuffer, {type: 'buffer', sheetStubs: true})

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const jsonData: T = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            rawNumbers: true,
            blankrows: false,
            defval: null,
        }) as T

        return new SpreadsheetTestFile<T>(jsonData, filePath, fileSpecs)
    }

    private validateFileSpecs(fileSpecs: FileSpecs<R>, jsonData: SpreadsheetFileData) {
        const header = fileSpecs.header
        if (jsonData[0].length != header.length) {
            throw new Error(`Invalid data length. Expected ${header.length}, got ${jsonData[0].length}`)
        }

        if (jsonData[0].join(',') !== header.join(',')) {
            throw new Error(`Invalid header. Expected header: ${header.join()}, got: ${jsonData[0].join()}`)
        }
    }

    static write<T extends SpreadsheetFileData = SpreadsheetFileData, R extends string[] = string[]>(fileData: T, filePath: string, fileSpecs?: FileSpecs<R>): SpreadsheetTestFile<T> {
        const file = new SpreadsheetTestFile(
            fileData,
            filePath,
            fileSpecs
        )

        file.write(filePath, fileSpecs)

        return file
    }

    write(outputPath: string, fileSpecs?: FileSpecs<R>): void {
        if (fileSpecs) {
            this.validateFileSpecs(fileSpecs, this.data);
        }

        this.path = outputPath

        this.createOutputFolder(outputPath)

        const wb = XLSX.utils.book_new()

        let fileDataWithHeader: SpreadsheetFileData = [...this.data]

        const ws = XLSX.utils.aoa_to_sheet(fileDataWithHeader)

        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

        const fileExtension = extname(outputPath).toLowerCase()

        if (fileExtension === '.csv') {
            XLSX.writeFile(wb, outputPath, { bookType: 'csv' })
        } else {
            XLSX.writeFileXLSX(wb, outputPath)
        }
    }

    print() {
        console.table(this.data)
    }

    private createOutputFolder(finalFilePath: string) {
        const dirPath = dirname(finalFilePath)
        fs.mkdirSync(dirPath, { recursive: true })
    }

    constructor(
        readonly data: T,
        public path: string | null = null,
        readonly fileSpecs?: FileSpecs<R>) {

        if (fileSpecs) {
            this.validateFileSpecs(fileSpecs, data);
        }
    }
}