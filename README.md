## Caveats

### File paths
Normally when you import a track into EngineDJ it will store the location of the file relative to its Engine Library folder. This works fine for tracks that are stored on the same drive as the Engine Library itself.

In situations when you import a track from a drive that is not the same as the Engine Library then EngineDJ would create a new seperate Engine Library folder in the root of that drive. This is how it manages external drives as well.

This utility does not emulate that functionality, when creating a new track in the engine database using this library it will be stored in the database with an absolute path that references the drive letter.