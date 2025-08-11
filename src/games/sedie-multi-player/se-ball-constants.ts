import { buildVersion } from "../../_shared/constants";

export enum SeBallBetOptions {
    ODD = "odd",
    EVEN = "even",
    RED3 = "red3",
    RED4 = "red4",
    BLUE3 = "blue3",
    BLUE4 = "blue4",
    RED2 = "red2",
}

export const SeBallBetOptionsPercentageColor = {
    odd: "#84C6FF",
    even: "#FF9090",
};

export const DotColorMapper = {
    [SeBallBetOptions.RED3]: [true, true, true, false],
    [SeBallBetOptions.RED4]: [true, true, true, true],
    [SeBallBetOptions.BLUE3]: [true, false, false, false],
    [SeBallBetOptions.BLUE4]: [false, false, false, false],
    [SeBallBetOptions.RED2]: [true, true, false, false],
};

export const BetChoiceImagesData = {
    [SeBallBetOptions.ODD]: {
        src: `/static/images/sedie-multi-player/2x/bg-${SeBallBetOptions.ODD}.webp?v=${buildVersion}`,
        blur: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAABeCAYAAACHDE6RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVSSURBVHgB7dzNThtXGMbx95z5NJ+GQJSgSpmuuvUd1CzaWt2UXgEQqZGyansFJFeQZFUpaWt6BU03KVUXmCuocwOVkSra8hEbbDwztmdOzhlCQggQDBg8J89vg2c8iVj8OXp9ZoDRJSn84HvM4jnB4qw89AjgBIJEjcWsvPRNpnSa6xn1QL4osm4nyAnT+IoLkZffVK7d6VAQdiiKY1KvAU5icE6ObdFgxpGVskXqxL+cFPWFhlx44ufJ5LNCiJmmH2YbzUDG26ag1aZYBgzQLcs0aMB1aHJ8hCzLXKQgvr90N1M5fN2FhFz4yZ+TPzWzu36YV/HW6k2ECxduYmyEJseGK1Gn8/Wfd4bKB987V8hqBWYGf9Dwg9xmtU7NICSAXhoeyNDN69maXCmnD8Z8ppDVDJyJw2IrimbW1qsIGC6VivmjG+MVCsX0/pjBqUtqFXZF+NfWTmPm73/WETFcunrTpxfbux45rLh/rquQvygG37ZFvLy6tun9v7WNORiuzGZ1R+5+Rflkg4G6CLlQDBfCoP1wdW0DqzBcObWN+2K7Iffp2II6PtWMLCMuBkFrbvXfTazC0DfUXvMn3lTNZ/bH5vsuVisxIoZ+pFZluWOWHbTj3ImjhYq43e7cQ8TQr+ScrAZk79iQ1RCdRCxnYkQM/erV4w5Hh1wo+p4cootqjzgpHqDPHbMi8wV5p87D7gSkxTshf/7j7owcKeY25D4dQFq8EzLnxgNEDGnzVsjqKbamH3rb9SYBpMnbKzJjCxvVOgGkzeuQk+22ToQPeJBKb1Zkk89iNoa0eh3yq19PIoA0SkJWW26+H2Zx8wPSKgnZ4CyvHlYGSKsk5Jj4p+pX9QHSKgmZEeWwWwFpxj973MqFYZsA0owbLMpGeEwTUo6rh5Jb2K2AlFMzsoe/xQZp1/XftQDoRwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkCHVXNumWMRlhAyp5joWCUNUTAJIKUeuxpZpVJbmXazIkF7XRgeJCXqkXiNkSCXLNGl0eKAiWuKpOkbIkEq3piaS1XjpbqaijtWMXFF1A6TF1GSWLMtc/H3eebh/zqSYKrZpEEC/45zTjWsjcqQYLAVkf3/wPTMwg3LGyNTkRdk4jgmgHw24Nk1dHyfTNB4t3Xa/O/w+L82P1RhROTucIYB+4tgmjY8O0a2bE3ImnixZjE//cUTEyt5wHIn746PD+VrdJ6zKcBXU2ODKcAczjlx9HXmjw5bnWEUQ/cYi8VSuwqWT/j3bf1H4OViubjfy/21tE0CvyRsZybigglXhOo6VTAYy3OcijkotY6BUmme10/5/b7YrmJgfGx1abvih12gGBHBR9lfbvWhtueq6yWpLjJVktM+NKC49u+2W6RzYwYMvHzdybc6X19arWcQMZ6XC3QtWjgi2lQTMOFOhrjAhytSi0v7+70Vhh0+omGPT/HWzuuNtVOsE8D5OMtu68qslv9pyZ8GscUGlmOIVFrNyYLrlbsaEs2BHnSwUfY8E3Wt34tmN6g41/Ra1Ox0COO5DmRoT5E7BSi9W29NgJ71ZeOLnyaA5edls0w8paLUpwq7GB0nd/VVjwnk/lPUKO+2FKmrBRY4RyxJ8iCo8isrP7gyd60NZr7wEkYoPp81n8RkAAAAASUVORK5CYII=`,
    },
    [SeBallBetOptions.EVEN]: {
        src: `/static/images/sedie-multi-player/2x/bg-${SeBallBetOptions.EVEN}.webp?v=${buildVersion}`,
        blur: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAABeCAYAAACHDE6RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVqSURBVHgB7dzfUhNnGMfx5313s0YDTlKrdsaA8cT2zO0VGM8cB2jqDYhXUHsFyhXoHYhXUATG8Qx6BznsjFPZAmVqUFihgZBNsn2ehTBII3/kX97X32cmkmwSx4Ov7zz7boKiA5gpFrNuT4+vlCrEfCOAPag4DmK+qVYrzL96VaZToPZ6cm5goMjxPial/Gq1mq3X61SPIgLYi5dKked55DgOpdNpOVSmOJ5uxfHv/ZOTY3QCOoY8c/duIZVKPY+iqPh+aYmWl5ep2WoRwJfIZDJ0noO+2Nsr90NeHMdazeaLvsnJaTom/wt5/t49n1z3t/cfPhQqlQoChmMlq7WEffXyZVm1g2Ycj/RPTIzSEX0SskTc1Hpqfn4+u7K6SgAnqR10TyYT8IL561HGju2Qk3HC86b+mp0tIGI4TblsdnOFPndutL6xMXLj9euADkm37/CS//hdpYKI4dQthyH98eYN/VOpDPO4MSWbDHRIScjyRt6NGK4sLhLAWZFzsj+DoNBoNKb+Hhp6fJj3JiFrpR68Q8TQBXibl94GAfFW75PDxJyEzBc5huUvAOgGcq3izdu3tF6rPZkfHHx+kPdoGSskYlzogG7SbDaTlbm2sTF8kJWZpwrlc/kE0G3aMW+tzI/2eq3msSIrbwDoRtImbwkTX2V+utduhiaALidj79zCAmmtn8sH2Dq9BiGDEeQ8bnFpqeD19nY8+UPIYAzZZ+bVudRpxEDIYAyZl2XEUFo/3f0cQgajyIjBN392cHB453GEDMaRq9Ac7oOdxxAyGCdZldfWijtnZYQMRvq4ukracbZXZYQMRgrDkOI4LrX3lREyGEl2MOQL0fLtfnmMkMFYHze/BFKSPxAyGKtWq8me8m25j5DBWLXNT21itACzyZwcRREt3L9/3SUAg8ln6R3H+RErMhhNVmWtVBYhg9Hk9xHKL9ZEyGAFhAxWQMhgBYQMVkDIYAWEDFZAyGAFhAxWQMhgBYQMVkDIYAWEDFZAyGAFhAxWQMhgBYQMVkDIYAWEDFZAyGAFhAxWQMhgBYQMVkDIYAWEDFZAyGAFhAxWQMhgBYQMVkDIYAWEDFZAyGAFhAxWQMhghSRkx3EIwGRaxXHgaCzMYDYdOc50pqeHAEymb4yNBV4qFWQuXCAAUyUzRUz0IpfLEYCpkpAbWj/LZbNhKpUiABMlIfN4EVIcjxT6+wnARNvbFfmJiWdpz3uRv3aNAEwhW8e88xZ+su8Wue4jHjHK1/v6sLcMRjifTvMwEZdVpyfnhoaeRVH0S6VSoeUwJIBuJOd0P9y8SfnxcdXxSkjf+Pgjz3Uf8pgRfM8v/PbSJUpz+QDdpCeTIaXUqNxX+714bmCgqLQe5ru3mq2WX1tfp3+rVarybb1Wo1arRQBnQRbZlOPc6ZucnN435J1mSqWs02hI2EX+n3CLh5NijWOWoFdWVqgeRSSPAU7a1StX5DZ67eXLh/L4UCF3kqzYSvkc920eun2OuSCrdnVtjda3fgIcp4u9vcRbxUFd6ztyZVqOHTnk3XjVLvCq7SerNtFtPuS3x5D2Tz6RJIAvIRHn8/nQcd07+bGxcvv4sYe8m4wjroTNqzZp/RNtrtrZ9qot8zbGEdiP1pq+43GCNx6CWOufd0YsTjzkTuZLJZ+aTZ9POYuEk0jYgwT8TS5Hl3jnjHfSpiPHedgeJ3Y6k5B3a6/a/K8ubZ1E+rxKZ+v1ehI1fH083iP2PI8ymYx8fKLM518jsjvxudd3RcidyKrdajQKPGv7BF8d+cIHxxs0XLecfBZoH/8Bdq8lwpd7VG0AAAAASUVORK5CYII=`,
    },
    [SeBallBetOptions.BLUE3]: {
        src: `/static/images/sedie-multi-player/2x/bg-${SeBallBetOptions.BLUE3}.webp?v=${buildVersion}`,
        blur: "",
    },
    [SeBallBetOptions.RED2]: {
        src: `/static/images/sedie-multi-player/2x/bg-${SeBallBetOptions.RED2}.webp?v=${buildVersion}`,
        blur: "",
    },
    [SeBallBetOptions.RED4]: {
        src: `/static/images/sedie-multi-player/2x/bg-${SeBallBetOptions.RED4}.webp?v=${buildVersion}`,
        blur: "",
    },
};


