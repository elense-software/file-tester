import {FileSpecs, TestFile} from "./test-file";
import fs from "fs";
import * as XLSX from "xlsx";
import {dirname, extname} from "path";

export type SpreadsheetFileData = any[][]

export class SpreadsheetTestFile<FILE extends SpreadsheetFileData = SpreadsheetFileData, HEADER extends string[] = string[]> implements TestFile<FILE> {
    static get<FILE extends SpreadsheetFileData, HEADER extends string[] = string[]>(path: string | Buffer, fileSpecs?: FileSpecs<HEADER>): SpreadsheetTestFile<FILE> {
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

        const jsonData: FILE = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            rawNumbers: true,
            blankrows: false,
            defval: null,
        }) as FILE

        return new SpreadsheetTestFile<FILE>(jsonData, filePath, fileSpecs)
    }

    static write<FILE extends SpreadsheetFileData = SpreadsheetFileData, HEADER extends string[] = string[]>(fileData: FILE, filePath: string, fileSpecs?: FileSpecs<HEADER>): SpreadsheetTestFile<FILE> {
        const file = new SpreadsheetTestFile(
            fileData,
            filePath,
            fileSpecs
        )

        file.write(filePath, fileSpecs)

        return file
    }

    constructor(
        readonly data: FILE,
        public path: string | null = null,
        readonly fileSpecs?: FileSpecs<HEADER>) {

        if (fileSpecs) {
            this.validateFileSpecs(fileSpecs, data);
        }
    }

    write(outputPath: string, fileSpecs?: FileSpecs<HEADER>): void {
        if (fileSpecs) {
            this.validateFileSpecs(fileSpecs, this.data);
        }

        this.path = outputPath

        this.createOutputFolder(outputPath)

        const wb = XLSX.utils.book_new()

        let fileDataWithHeader: SpreadsheetFileData = [...this.data]

        const ws = XLSX.utils.aoa_to_sheet(fileDataWithHeader, {sheetStubs: true})

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
        const dirPath: string = dirname(finalFilePath)
        fs.mkdirSync(dirPath, { recursive: true })
    }

    private validateFileSpecs(fileSpecs: FileSpecs<HEADER>, jsonData: SpreadsheetFileData) {
        const header: HEADER = fileSpecs.header
        if (jsonData[0].length != header.length) {
            throw new Error(`Invalid data length. Expected ${header.length}, got ${jsonData[0].length}`)
        }

        if (jsonData[0].join(',') !== header.join(',')) {
            throw new Error(`Invalid header. Expected header: ${header.join()}, got: ${jsonData[0].join()}`)
        }
    }
}