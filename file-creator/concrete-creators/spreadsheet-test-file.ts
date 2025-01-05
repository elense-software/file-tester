import {FileData, TestFile} from "./test-file";
import fs from "fs";
import * as XLSX from "xlsx";
import {dirname, extname} from "path";

export type SpreadsheetFileData = any[][]

export class SpreadsheetTestFile implements TestFile<SpreadsheetFileData> {
    static get(path: string | Buffer): SpreadsheetTestFile {
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

        const jsonData: FileData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            rawNumbers: true,
            blankrows: false,
            defval: null,
        })

        return new SpreadsheetTestFile(jsonData, filePath)
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
    }

    print() {
        console.table(this.data)
    }

    private createOutputFolder(finalFilePath: string) {
        const dirPath = dirname(finalFilePath)
        fs.mkdirSync(dirPath, { recursive: true })
    }

    constructor(
        readonly data: SpreadsheetFileData,
        readonly path: string | null = null) {
    }
}