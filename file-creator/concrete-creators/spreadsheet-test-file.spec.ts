import {SpreadsheetTestFile} from "./spreadsheet-test-file";
import path from "path";

import {TestFilesDirectory} from "../test-files-directory";
import {FileSpecs} from "./test-file";
import {StaticTestFilesDirectory} from "../static-test-files-directory";

describe('SpreadsheetTestFile', () => {
    const bufferData = Buffer.from('some buffer data');

    it('creates an instance from a file path', () => {
        const filePath = new StaticTestFilesDirectory(__dirname).path('test-name-lastname-age.xlsx')
        const instance = SpreadsheetTestFile.get(filePath);
        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toBe(filePath);
    });

    it('creates a typeless instance from a file path by constructor', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file-2.xlsx');

        let fileData = [
            ['Name', 'Last name', 'Age'],
            ['John', 'Doe', 30]
        ];

        const instance = new SpreadsheetTestFile(fileData);
        instance.write(file);

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });

    it('creates a typeless instance from a file path by factory method', () => {
        const path = new TestFilesDirectory(__dirname).path('generated-file-3.xlsx');

        let fileData = [
            ['Name', 'Last name', 'Age'],
            ['John', 'Doe', 30]
        ];

        const instance = SpreadsheetTestFile.write(fileData, path);

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(path);
    });

    it('creates an instance of specific type from a file path', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file-2.xlsx');

        type PeopleRegistryFileData = [string, string, string][]

        let fileData: PeopleRegistryFileData = [['Name', 'Last name', 'Age']];
        const instance = new SpreadsheetTestFile(fileData);
        instance.write(file);

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });

    it('creates an instance of specific type from a file path by factory method', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file-2.xlsx');

        type PeopleRegistryFileData = [string, string, string][]

        let fileData: PeopleRegistryFileData = [['Name', 'Last name', 'Age']];
        const instance = SpreadsheetTestFile.write(fileData, file);

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });

    it('creates an instance of specific type from a file path and validates against specs', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file-2.xlsx');

        type PeopleRegistryHeader = [string, string, string, string]
        type PeopleRegistryRow = [string, string, number, string]

        class PeopleFileSpec implements FileSpecs {
            readonly header = ['First Name', 'Last name', 'Age', "Type"]
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

    it('creates an instance of specific type from a file path and validates against specs with full typing', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file-2.xlsx');

        type PeopleRegistryHeader = [string, string, string, string]
        type PeopleRegistryRow = [string, string, number, string]
        type PeopleRegistryFile = [
            PeopleRegistryHeader,
            ...PeopleRegistryRow[]
        ]

        class PeopleFileSpec implements FileSpecs<PeopleRegistryHeader> {
            readonly header: PeopleRegistryHeader = ['First Name', 'Last name', 'Age', "Type"]
        }

        let fileData: PeopleRegistryFile = [
            ['First Name', 'Last name', 'Age', "Type"],
            ['John', 'Doe', 30, "Admin"]
        ];

        const instance = SpreadsheetTestFile.write<
            PeopleRegistryFile,
            PeopleRegistryHeader>(fileData, file, new PeopleFileSpec())

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });

    it('creates an instance of specific type from a file path and validates against specs when header and row types are the same', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file-2.xlsx');

        type PeopleRegistryRow = [string, string, string, string]
        type PeopleRegistryFile = [
            ...PeopleRegistryRow[]
        ]

        class PeopleFileSpec implements FileSpecs<PeopleRegistryRow> {
            readonly header: PeopleRegistryRow = ['First Name', 'Last name', 'Age', "Type"]
        }

        let fileData: PeopleRegistryFile = [
            ['First Name', 'Last name', 'Age', "Type"],
            ['John', 'Doe', '30', "Admin"]
        ];

        const instance = SpreadsheetTestFile.write<
            PeopleRegistryFile,
            PeopleRegistryRow>(fileData, file, new PeopleFileSpec())

        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toEqual(file);
    });

    it('creates an instance from a buffer', () => {
        const instance = SpreadsheetTestFile.get(bufferData);
        expect(instance).toBeInstanceOf(SpreadsheetTestFile);
        expect(instance.path).toBeNull();
    });

    it('writes the buffer to a file', () => {
        const file = new TestFilesDirectory(__dirname).path('generated-file.xlsx');

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