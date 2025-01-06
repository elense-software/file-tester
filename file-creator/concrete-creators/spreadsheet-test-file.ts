import {FileData, TestFile} from "./test-file";
import fs from "fs";
import * as XLSX from "xlsx";
import {dirname, extname} from "path";

export type SpreadsheetFileData = any[][]
export type MyFileData = [string, string, number][]

export class SpreadsheetTestFile<T extends SpreadsheetFileData = SpreadsheetFileData> implements TestFile<T> {
    static get<T extends SpreadsheetFileData>(path: string | Buffer): SpreadsheetTestFile<T> {
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

        return new SpreadsheetTestFile<T>(jsonData, filePath)
    }

    static write<T extends SpreadsheetFileData = SpreadsheetFileData>(fileData: T, filePath: string): SpreadsheetTestFile {
        const file = new SpreadsheetTestFile(
            fileData,
            filePath
        )

        file.write(filePath)

        return file
    }

    write(outputPath: string): void {
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

        this.path = outputPath
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
        public path: string | null = null) {
    }
}