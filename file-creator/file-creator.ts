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

