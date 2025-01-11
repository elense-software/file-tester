import {TestFilesDirectory} from "./test-files-directory";

export class RuntimeTestFilesDirectory extends TestFilesDirectory {
    static defaultFolderName = 'runtime-test-files'

    constructor(basePath: string, folder: string = RuntimeTestFilesDirectory.defaultFolderName) {
        super(basePath, folder)
    }
}