### StaticTestFilesDirectory 

A convention to manage static files meant to be commited to repo, like example user inputs etc.
By default it operates on provided base path and 'static-files-directory'.
If used across repo it makes a coherent way to manage static files.
```typescript
describe('Your test using ./static-test-files/test-file.txt file as input', () => {
    const staticTestDir: StaticTestFilesDirectory = new StaticTestFilesDirectory(__dirname);

    it('Get file path from static folder', () => {
        const absoluteFilePath: string = staticTestDir.path('test-file.txt')

        expect(absoluteFilePath).toBe(path.resolve(__dirname, 'static-test-files', 'test-file.txt'));
    });

    it('Read file from static folder', () => {
        const fileContent: string = staticTestDir.readFile('test-file.txt', 'utf8')

        expect(fileContent).toBe('Static test file.');
    });
});
```
### RuntimeTestFilesDirectory
A wrapper for a specified directory for reading and writing files. By default, it creates a directory named `runtime-test-files` in the specified base directory. By adding '**/runtime-test-files' to .gitignore you provide clean and coherent way to manage generated files which are not supposed to be commited.
```typescript
describe('Your test which generates files dynamically in runtime', () => {
    const runtimeTestDir: RuntimeTestFilesDirectory = new RuntimeTestFilesDirectory(__dirname);

    beforeAll(() => {
        // Resetting the dir only once so that you can view the files during tests debug
        runtimeTestDir.reset()
    });

    it('Writes file.txt, reads it and verifies contents', () => {
        const fileContent = "Runtime test file content"

        runtimeTestDir.writeFile('file.txt', fileContent)

        const savedFile = runtimeTestDir.readFile('file.txt', 'utf8')

        expect(savedFile).toEqual(fileContent);
    });

    it('Provides path to files but let you write and read on your own', () => {
        const filePath = runtimeTestDir.path('another-file.csv');

        fs.writeFileSync(filePath, 'Name,LastName,Age\nRadek,Landowski,22')
        const fileContent = fs.readFileSync(filePath, 'utf8')

        expect(fileContent).toEqual('Name,LastName,Age\nRadek,Landowski,22');
    });
});
```

Using both StaticTestFilesDirectory and RuntimeTestFilesDirectory in one test to provide separation between static inputs and runtime outputs.
```typescript
it('Load ./static-test-files/test-sentence.txt and save updated content in ./runtime-test-files/test.sentence.updated.txt', () => {
    const staticDir: TestFilesDirectory = new StaticTestFilesDirectory(__dirname)
    const testSentenceFile = staticDir.readFile('test-sentence.txt', 'utf8')

    expect(testSentenceFile).toEqual("This is a test sentence.")

    const updatedFileContent = testSentenceFile + " Updated!"

    const runtimeDir: RuntimeTestFilesDirectory = new RuntimeTestFilesDirectory(__dirname)
    runtimeDir.writeFile('test-sentence-updated.txt', updatedFileContent)

    const updatedFile = runtimeDir.readFile('test-sentence-updated.txt', 'utf8')
    expect(updatedFile).toBe('This is a test sentence. Updated!');
});
```

### TestFilesDirectory

TestFilesDirectory is the most reusable component being a base for StaticTestFilesDirectory and RuntimeTestFilesDirectory. It provides basic functionality to manage files in a specified directory.
```typescript
it('Minimal use', () => {
    // setup dir for this test's files
    const dir: TestFilesDirectory = new TestFilesDirectory(__dirname);

    dir.reset() // clears and creates relative ./test-files folder

    const testFilePath: string = dir.path('file.txt') // returns path to ./test-files/file.txt

    fs.writeFileSync(testFilePath, 'test')
    const file = fs.readFileSync(testFilePath, 'utf8')

    expect(file).toBe('test');
});
```