exports.open = () => {
  $ui.push({
    props: {
      title: "防疫知识"
    },
    views: [
      {
        type: "scroll",
        props: {
          zoomEnabled: true
        },
        layout: $layout.fill,
        views: [
          {
            type: "image",
            props: {
              src: "assets/tips.png"
            },
            layout: $layout.fill
          }
        ]
      }
    ]
  });
}