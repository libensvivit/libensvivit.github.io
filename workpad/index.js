console.log("LOL");

for (let i = 1; i < 3; i++) {
    new EditorJS({
        holderId: "editorjs"+i.toString(),
        tools: {
          image: SimpleImage,
          embed: Embed,
        },
      });
}
