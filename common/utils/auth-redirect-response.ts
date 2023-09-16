export const successConfluenceAuthMessageHTML = `<p>Successfully linked to your Confluence <img src="https://cdn.icon-icons.com/icons2/2429/PNG/512/confluence_logo_icon_147305.png" alt="Confluence Icon" class="production-icon"> site!</p>
<p>You can close this page, and use the <img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/slack_tile_logo_icon_168820.png" alt="Slack Icon" class="production-icon"> shortcut or button again.</p>`;

export const returnBody = (message: string) => {
  return `
    <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">
            <style>
                body, html {
                    background-color: #f4f4f8;
                    color: #333;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                }
                .container {
                    background-color: #f4f4f8;
                    padding: 20px;
                    width: 100%;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .logo {
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    background-image: url('https://i.ibb.co/2Y5Jtm1/logo.jpg');
                    background-size: cover;
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Poppins', sans-serif;
                    width: 100%;
                }
                .product-name {
                    font-size: 26px;
                    font-weight: 800;
                    color: #333;
                    margin-left: 15px;
                }
                .divider {
                    width: 100vw;
                    height: 1px;
                    background-color: #333;
                    margin: 15px 0;
                }
                .message {
                    font-size: 18px;
                    font-weight: 700;
                    font-family: 'Poppins', sans-serif;
                    max-width: 600px;
                    word-wrap: break-word;
                    text-align: center;
                }
                .production-icon {
                    width: 20px;
                    height: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo"></div>
                    <div class="product-name">ThreadBase</div>
                </div>
                <div class="divider"></div>
                <div class="message">
                    ${message}
                </div>
            </div>
            <script>
                setTimeout(function() {
                    window.close(); // or redirect: window.location.href = 'your_app_url';
                }, 3000);
            </script>
        </body>
    </html> `;
};
