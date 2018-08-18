using SixLabors.ImageSharp;
using SixLabors.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SixLabors.ImageSharp.Drawing;

namespace MusicPlayerV2.Helper
{
    public class ImageResizer
    {
        public static byte[] ResizeImageTo(byte[] img, int w, int h, bool fromOutside)
        {


            SixLabors.ImageSharp.Image<Rgba32> bmp = null;
            try
            {
                using (System.IO.MemoryStream ms = new System.IO.MemoryStream(img))
                    bmp = SixLabors.ImageSharp.Image.Load(ms);

                using (var resultImg = ResizeImageTo(bmp, w, h, fromOutside))
                {

                    using (System.IO.MemoryStream outMS = new System.IO.MemoryStream())
                    {
                        resultImg.Save(outMS, new SixLabors.ImageSharp.Formats.Png.PngEncoder());
                        return outMS.ToArray();
                    }
                }
            }
            finally
            {
                if (bmp != null)
                    bmp.Dispose();
            }
        }

        public static SixLabors.ImageSharp.Image<Rgba32> ResizeImageTo(SixLabors.ImageSharp.Image<Rgba32> img, int w, int h, bool fromOutside)
        {

            float sW;
            float sH;

            if (fromOutside)
            {
                if (img.Width > img.Height)
                {
                    float ratio = (float)h / (float)img.Height;
                    sW = img.Width * ratio;
                    sH = h;
                }
                else
                {
                    float ratio = (float)w / (float)img.Width;
                    sW = w;
                    sH = img.Height * ratio;
                }
            }
            else
            {
                if (img.Width > img.Height)
                {
                    float ratio = (float)w / (float)img.Width;
                    sW = w;
                    sH = img.Height * ratio;

                    if (sH > h)
                    {
                        ratio = h / sH;
                        sH = h;
                        sW = sW * ratio;
                    }
                }
                else
                {
                    float ratio = (float)h / (float)img.Height;
                    sW = img.Width * ratio;
                    sH = h;

                    if (sW > w)
                    {
                        ratio = w / sW;
                        sH = sH * ratio;
                        sW = w;
                    }

                }
            }

            Rectangle r = new Rectangle((int)(w / 2.0 - sW / 2.0), (int)(h / 2.0 - sH / 2.0), (int)sW, (int)sH);

            Image<Rgba32> outImg = new Image<Rgba32>(w, h);
            outImg.Mutate(op => op.DrawImage(img, 1, new Size(r.Width, r.Height), new Point(r.X, r.Y)));
            return outImg;
        }
    }
}
