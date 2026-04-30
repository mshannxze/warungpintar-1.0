import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "API Docs — Warung Madura",
    description: "Swagger UI untuk REST API Warung Madura",
};

const SWAGGER_VERSION = "5.17.14";

export default function ApiDocsPage() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Warung Madura — API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui.css" />
  <style>body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui-bundle.js" crossorigin></script>
  <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_VERSION}/swagger-ui-standalone-preset.js" crossorigin></script>
  <script>
    window.addEventListener('load', function () {
      window.ui = SwaggerUIBundle({
        url: '/api/docs',
        dom_id: '#swagger-ui',
        deepLinking: true,
        withCredentials: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset,
        ],
        layout: 'BaseLayout',
      });
    });
  </script>
</body>
</html>`;

    return (
        <iframe
            title="Swagger UI"
            srcDoc={html}
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100vh",
                border: "none",
            }}
        />
    );
}
