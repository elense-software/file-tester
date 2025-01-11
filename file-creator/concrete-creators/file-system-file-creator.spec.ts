import fs from 'fs'
import {FileSystemFileCreator} from "./file-system-file-creator";
import {SpreadsheetTypes} from "../file-creator";
import {TestFile} from "./test-file";
import {TestFilesDirectory} from "../test-files-directory";

describe('FileSystemFileCreator', () => {
    let fileCreator: FileSystemFileCreator

    const extensions: SpreadsheetTypes[] = ['xlsx', 'csv']

    for (let i = 0; i < extensions.length; i++) {
        const extension: SpreadsheetTypes = extensions[i]

        describe(`Extension: ${extension}`, () => {
            const testOutputPath = new TestFilesDirectory(__dirname, `${TestFilesDirectory.defaultFolderName}/${extension}`)

            beforeAll(() => {
                testOutputPath.clear()

                fileCreator = new FileSystemFileCreator()
            })

            it('creates output folder if it does not exist', async () => {
                const fileName = `test.${extension}`
                const absoluteFilePath = testOutputPath.path(fileName)
                const fileData = [[]]

                await fileCreator.create(absoluteFilePath, fileData)

                expect(fs.existsSync(absoluteFilePath)).toBe(true)
            })

            it('writes file with header row if provided', async () => {
                const filePath = testOutputPath.path( `test-name-lastname-age.${extension}`)
                const fileData = [
                    ['Name', 'Last name', 'Age'],
                    ['Radek', 'Landowski', 20]
                ]

                const result: TestFile = await fileCreator.create(filePath, fileData)

                expect(result.data).toEqual(fileData)
            })

            it('writes file without header', async () => {
                const filePath = testOutputPath.path( `test-radek-landowski-20-no-header.${extension}`)
                const fileData = [['Radek', 'Landowski', 20]]

                const result: TestFile = await new FileSystemFileCreator().create(filePath, fileData)

                expect(result.data).toEqual(fileData)
            })

            it('writes file with header row even when data is empty', async () => {
                const filePath = testOutputPath.path(`test-name-lastname-age-no-data.${extension}`)
                const fileData = [['Name', 'Last name', 'Age']]

                const result: TestFile = await fileCreator.create(filePath, fileData)

                expect(result.data).toEqual(fileData)
            })
        })
    }
})
