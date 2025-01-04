import path, { dirname } from 'path'
import fs from 'fs'
import * as XLSX from 'xlsx'
import {FileCreator, FileCreatorConfiguration} from "../file-creator";

export type HeaderRow = string[] | null

export class TestFile {
    static get(file: string | Buffer): TestFile {
        let fileBuffer: Buffer
        if (Buffer.isBuffer(file)) {
            fileBuffer = file
        } else {
            fileBuffer = fs.readFileSync(file)
        }

        const workbook = XLSX.read(fileBuffer, { type: 'buffer', sheetStubs: true })

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            rawNumbers: true,
            blankrows: false,
            defval: null,
        })

        return new TestFile(jsonData)
    }

    constructor(readonly jsonData: any[][]) {

    }
}

export class FileSystemFileCreator implements FileCreator {
    constructor(readonly configuration: FileCreatorConfiguration) {}

    async create(filePath: string, fileData: any[][]): Promise<any[][]> {
        this.createOutputFolder(filePath)
        this.writeFile(fileData, filePath, this.configuration.headerRow)
        return this.readFile(filePath)
    }

    readFile(filePath: string | Buffer): any[][] {
        return TestFile.get(filePath).jsonData
    }

    private writeFile(fileData: any[][], finalFilePath: string, headerRow?: HeaderRow) {
        const wb = XLSX.utils.book_new()

        let fileDataWithHeader: (any | string)[][] = [...fileData]

        if (headerRow && Array.isArray(headerRow)) {
            fileDataWithHeader = [headerRow, ...fileData]
        }

        const ws = XLSX.utils.aoa_to_sheet(fileDataWithHeader)

        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

        const fileExtension = path.extname(finalFilePath).toLowerCase()

        if (fileExtension === '.csv') {
            XLSX.writeFile(wb, finalFilePath, { bookType: 'csv' })
        } else {
            XLSX.writeFileXLSX(wb, finalFilePath)
        }
    }

    private createOutputFolder(finalFilePath: string) {
        const dirPath = dirname(finalFilePath)
        fs.mkdirSync(dirPath, { recursive: true })
    }
}
