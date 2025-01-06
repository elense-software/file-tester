export type FileData = any[][];

export interface FileSpecs<T extends string[] = string[]> {
    header: T
}

export interface TestFile<T = FileData> {
    /**
     * Data from the file.
     */
    data: T

    /**
     * Path to the file. If the file was created in memory, this will be null.
     */
    path: string | null

    write(outputPath: string): void

    print(): void
}