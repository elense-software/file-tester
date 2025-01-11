import {TestFilesDirectory} from "./test-files-directory";

export class StaticTestFilesDirectory extends TestFilesDirectory {
    static defaultFolderName = 'static-test-files'

    constructor(basePath: string, folder: string = StaticTestFilesDirectory.defaultFolderName) {
        super(basePath, folder)
    }
}