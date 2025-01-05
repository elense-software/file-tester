import {TestFile} from "../file-creator/concrete-creators/test-file";

export interface FileVerifier {
    verify(actualFile: TestFile, params: any): Promise<void>
}
