from syqlorix import *

doc = Syqlorix()

@doc.route('/')
def main_page(request):
    return Syqlorix(
        head(
                meta(charset="UTF-8"),
    meta(name="viewport", content="width=device-width, initial-scale=1.0"),
    title(
        "HTML to Syqlorix Converter"
    ),
    meta(name="description", content="A real-time, professional-grade tool to convert full HTML documents into runnable Syqlorix Python code with a live preview and a VS Code-style editor."),
    link(rel="icon", href="https://raw.githubusercontent.com/Syqlorix/Syqlorix/main/syqlorix-logo.svg", type="image/svg+xml"),
    link(href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css", rel="stylesheet"),
    link(rel="stylesheet", href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"),
    link(rel="preconnect", href="https://fonts.googleapis.com"),
    link(rel="preconnect", href="https://fonts.gstatic.com", crossorigin=True),
    link(href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Fira+Code&display=swap", rel="stylesheet"),
    link(rel="stylesheet", href="/style.css")
        ),
        body(
                header(
        div(
            img(src="https://raw.githubusercontent.com/Syqlorix/Syqlorix/main/syqlorix-logo.svg", alt="Syqlorix Logo", class_="w-8 h-8 mr-3"),
            h1(
                "HTML to Syqlorix Converter"
            , class_="text-2xl font-bold", style="color: var(--primary-color);")
        , class_="flex items-center justify-center mb-2"),
        p(
            "A professional tool with a live preview and VS Code-style editor to convert any HTML document into a complete, runnable Syqlorix script."
        , class_="text-gray-400 mb-4 px-4"),
        div(
            label(
                "Load an Example:"
            , for_="example-select", class_="text-gray-400"),
            select(
                option(
                    "Simple Page"
                , value="simple"),
                option(
                    "Advanced Demo"
                , value="advanced"),
                option(
                    "App Template"
                , value="template")
            , id="example-select", class_="select-custom")
        , class_="flex items-center justify-center gap-3")
    , class_="header-bg text-center py-6"),
    main(
        div(
            div(
                div(
                    label(
                        "HTML Input"
                    , class_="block text-gray-400 font-bold mb-3"),
                    div(id="html-input-container", class_="editor-container")
                , class_="bg-gray-900 rounded-lg p-4"),
                div(
                    div(
                        label(
                            "Syqlorix Output"
                        , class_="text-gray-400 font-bold"),
                        div(
                            button(
                                i(class_="fas fa-copy mr-1"),
                                "Copy"
                            , id="copy-button", class_="btn-primary text-sm"),
                            button(
                                i(class_="fas fa-download mr-1"),
                                "Download .py"
                            , id="download-button", class_="btn-primary text-sm")
                        , class_="flex gap-2")
                    , class_="flex justify-between items-center mb-3"),
                    div(id="syqlorix-output-container", class_="editor-container readonly")
                , class_="bg-gray-900 rounded-lg p-4")
            , class_="space-y-6"),
            div(
                div(
                    label(
                        "Live Output Preview"
                    , class_="text-gray-400 font-bold"),
                    button(
                        i(class_="fas fa-times text-xl")
                    , class_="preview-close md:hidden text-gray-400 hover:text-white")
                , class_="flex justify-between items-center mb-3 md:bg-gray-900 md:rounded-lg md:p-4 md:mb-0"),
                div(id="status-message", class_="status mb-3"),
                button(
                    i(class_="fas fa-expand mr-1"),
                    "Expand"
                , id="fullscreen-button", class_="btn-primary text-sm"),
                div(
                    iframe(id="preview-frame", title="Live Preview", sandbox="allow-scripts allow-same-origin", class_="w-full h-96 md:h-full")
                , class_="flex-1 md:bg-gray-900 md:rounded-lg md:p-4")
            , class_="preview-panel bg-gray-900 rounded-lg p-4 md:bg-transparent md:p-0")
        , class_="desktop-layout")
    , class_="flex-1 p-4 md:p-6"),
    button(
        i(class_="fas fa-eye")
    , class_="preview-toggle md:hidden"),
    footer(
        p(
            "Built for the",
            a(
                "Syqlorix"
            , href="https://github.com/Syqlorix/Syqlorix", target="_blank", rel="noopener noreferrer", class_="font-bold hover:underline", style="color: var(--primary-color);"),
            "project. This tool runs entirely in your browser."
        , class_="text-gray-400")
    , class_="header-bg text-center py-6"),
    div(
        button(
            i(class_="fas fa-times")
        , id="modal-close-button", class_="modal-close-btn"),
        iframe(id="modal-preview-frame", title="Fullscreen Preview", sandbox="allow-scripts allow-same-origin")
    , id="preview-modal", class_="modal-overlay"),
            script(src="https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs/loader.js"),
            script(src="https://syqlorix-canvas.vercel.app/script.js")
        )
    )