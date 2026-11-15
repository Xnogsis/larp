"""Password entry, popup recovery and stable about:blank navigation."""
from functools import partial
from http.server import ThreadingHTTPServer
from threading import Thread
import shutil
import subprocess
from playwright.sync_api import sync_playwright, expect
from browser_support import CatalogHandler, ROOT, unlock_entry, ENTRY_PASSWORD, mock_entry_exit

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(CatalogHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=shutil.which('chromium'), headless=True)
        for saved, target in [(None, 'gnmath.html'), ('ugs.html', 'ugs.html'), ('gnmath.html', 'gnmath.html'), ('https://other.example/', 'gnmath.html')]:
            context = browser.new_context()
            if saved:
                context.add_cookies([{'name':'access_granted', 'value':saved, 'url':base}])
            page = context.new_page()
            requests = []
            context.on('request', lambda request: requests.append(request.url))
            page.goto(base + '/')
            expect(page).to_have_title('Clever')
            expect(page.get_by_role('heading', name='404 Not Found')).to_be_visible()
            assert page.locator('input').count() == 0
            page.keyboard.press('Tab')
            page.keyboard.type('wrong')
            page.keyboard.press('Enter')
            expect(page.locator('#message')).to_have_text('nope')
            assert len(context.pages) == 1
            assert not any('www.google.com' in url for url in requests)
            assert not any('/gnmath.html' in url or '/ugs.html' in url for url in requests)
            assert 'gnmath.html' not in page.content()
            page.keyboard.type('stray')
            popup = unlock_entry(page)
            assert popup.evaluate('window.opener') is None
            site = popup.frame_locator('#content-frame')
            site.locator('#grid .zone').first.wait_for()
            assert site.locator('body').evaluate('() => location.pathname') == '/' + target
            expect(popup).to_have_title('Clever')
            for tab, path in [('Home','/home.html'), ('UGS','/ugs.html'), ('Games','/gnmath.html')]:
                site.locator('nav').get_by_role('link', name=tab, exact=True).click()
                site.locator('nav a[aria-current="page"]').wait_for()
                assert site.locator('body').evaluate('() => location.pathname') == path
                assert popup.url == 'about:blank'
            site.locator('#grid .zone').first.click()
            site.frame_locator('#frame').locator('#game-control').wait_for()
            assert popup.url == 'about:blank'
            site.locator('#close').click()
            expect(site.locator('#viewer')).not_to_be_visible()
            assert popup.locator('#content-frame').get_attribute('allowfullscreen') is not None
            # Saved catalog cookies never bypass the password on the next visit.
            page.goto(base + '/')
            expect(page.get_by_role('heading', name='404 Not Found')).to_be_visible()
            assert page.locator('input').count() == 0
            context.close()
        context = browser.new_context()
        page = context.new_page()
        mock_entry_exit(page)
        page.goto(base + '/')
        page.evaluate('window.nativeOpen=window.open; window.open=()=>null')
        page.keyboard.type(ENTRY_PASSWORD[:-1] + ('x' if ENTRY_PASSWORD[-1] != 'x' else 'y'))
        page.keyboard.press('Backspace')
        page.keyboard.type(ENTRY_PASSWORD[-1])
        page.keyboard.press('Enter')
        expect(page.locator('#message')).to_contain_text('Pop-up blocked')
        assert len(context.pages) == 1 and page.url == base + '/'
        page.evaluate('() => { window.open=window.nativeOpen; }')
        with page.expect_popup() as opened:
            page.get_by_role('button', name='Open', exact=True).click()
        opened.value.frame_locator('#content-frame').locator('#grid .zone').first.wait_for()
        assert opened.value.url == 'about:blank'
        page.wait_for_url('https://www.google.com/')
        context.close()
        # A generated payload with a different password length works in real Web Crypto.
        regenerated = subprocess.check_output(['node', '-e', """
const fs=require('node:fs');const {decrypt,encrypt,update}=require('./.github/scripts/entry-payload.cjs');
const source=fs.readFileSync('index.html','utf8');const payload=/const payload = '([^']+)'/.exec(source)[1];
const shell=decrypt(payload,process.env.ENTRY_PASSWORD||'locked');
process.stdout.write(update(source,encrypt(shell,'entry-test-123'),14));
"""], cwd=ROOT, text=True)
        context = browser.new_context()
        page = context.new_page()
        mock_entry_exit(page)
        page.route(base + '/', lambda route: route.fulfill(body=regenerated, content_type='text/html'))
        page.goto(base + '/')
        with page.expect_popup() as opened:
            page.keyboard.type('entry-test-123')
        opened.value.frame_locator('#content-frame').locator('#grid .zone').first.wait_for()
        assert opened.value.url == 'about:blank'
        page.wait_for_url('https://www.google.com/')
        context.close()
        browser.close()
    print('Passed: encrypted password entry, wrong passwords, no pre-unlock catalog loads, saved targets, popup recovery, stable blank URLs and game controls')
finally:
    server.shutdown()
    server.server_close()
