import {FileCreator} from "./file-creator/file-creator";
import {FileUploader} from "./file-uploader/file-uploader";
import {FileDownloader} from "./file-downloader/file-downloader";
import {FileVerifier} from "./file-verifier/file-verifier";

export interface FileTester {
    fileCreator: FileCreator
    fileUploader?: FileUploader
    fileDownloader?: FileDownloader
    fileVerifier?: FileVerifier
}
