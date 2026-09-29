# Lê membros de um zip grande do CDN do TSE por HTTP Range, sem baixar o arquivo todo.
import io, zipfile, requests, sys
URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2022.zip'
S = requests.Session()

class Remoto(io.RawIOBase):
    def __init__(self, url):
        self.url = url; self.pos = 0
        self.size = int(S.head(url, timeout=60).headers['Content-Length'])
    def seekable(self): return True
    def readable(self): return True
    def tell(self): return self.pos
    def seek(self, off, whence=0):
        self.pos = off if whence == 0 else self.pos + off if whence == 1 else self.size + off
        return self.pos
    def readinto(self, b):
        n = min(len(b), self.size - self.pos)
        if n <= 0: return 0
        r = S.get(self.url, headers={'Range': f'bytes={self.pos}-{self.pos + n - 1}'}, timeout=300)
        d = r.content; b[:len(d)] = d; self.pos += len(d); return len(d)

z = zipfile.ZipFile(io.BufferedReader(Remoto(URL), buffer_size=4 * 1024 * 1024))
if __name__ != '__main__':
    pass
elif len(sys.argv) == 1:
    for i in z.infolist(): print(i.filename, i.compress_size, i.file_size)
else:
    for nome in sys.argv[1:]:
        with z.open(nome) as src, open(nome, 'wb') as dst:
            while True:
                c = src.read(8 * 1024 * 1024)
                if not c: break
                dst.write(c)
        print('ok', nome)
