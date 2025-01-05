import {TestFile} from "../file-creator/concrete-creators/test-file";

export interface FileDownloader {
    download(downloadParameters?: any): Promise<TestFile>
}
