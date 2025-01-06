import {SpreadsheetTestFile} from "./spreadsheet-test-file";
import path from "path";

import {TestFilesDirectory} from "../test-files-directory";
import {FileSpecs} from "./test-file";

describe('SpreadsheetTestFile', () => {
    const bufferData = Buffer.from('some buffer data');
    const filePath = path.resolve(__dirname, 'test-name-lastname-age.xlsx');

    it('creates an instance from a file path', () => {
        const instance = SpreadsheetTestFile.get(filePath);
        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toBe(filePath);
    });

    it('creates an instance of specific type from a file path', () => {
        const file = new TestFilesDirectory(__dirname, 'generated-files').path('generated-file-2.xlsx');

        type PeopleRegistryFileData = [string, string, string][]

        let fileData: PeopleRegistryFileData = [['Name', 'Last name', 'Age']];
        const instance = new SpreadsheetTestFile(fileData);
        instance.write(file);

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });


    it('creates an instance of specific type from a file path and validates against specs', () => {
        const file = new TestFilesDirectory(__dirname, 'generated-files').path('generated-file-2.xlsx');

        type PeopleRegistryHeader = [string, string, string, string]
        type PeopleRegistryRow = [string, string, number, string]

        class PeopleFileSpec implements FileSpecs<PeopleRegistryHeader> {
            readonly header: PeopleRegistryHeader = ['First Name', 'Last name', 'Age', "Type"]
        }

        let fileData: [
            PeopleRegistryHeader,
            ...PeopleRegistryRow[]
        ] = [
            ['First Name', 'Last name', 'Age', "Type"],
            ['John', 'Doe', 30, "Admin"]
        ];

        const instance = SpreadsheetTestFile.write(fileData, file, new PeopleFileSpec())

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });


    it('creates an instance from a buffer', () => {
        const instance = SpreadsheetTestFile.get(bufferData);
        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toBeNull();
    });

    it('writes the buffer to a file', () => {
        const file = new TestFilesDirectory(__dirname, 'generated-files').path('generated-file.xlsx');

        let fileData = [['Name', 'Last name', 'Age']];
        const instance = new SpreadsheetTestFile(fileData);
        instance.write(file);

        const writtenFile = SpreadsheetTestFile.get(file)
        expect(writtenFile.data).toEqual(instance.data);
    });

    it('throws an error if the file path is invalid', () => {
        expect(() => SpreadsheetTestFile.get('invalid/path')).toThrow();
    });

    it('handles empty buffer data gracefully', () => {
        const emptyBuffer = Buffer.from('');
        const instance = SpreadsheetTestFile.get(emptyBuffer);
        expect(instance.data).toEqual([]);
    });
});