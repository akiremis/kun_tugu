import pandas as pd

sutun_isimleri = ['Year', 'DOY', 'Hour', 'Bz_GSM', 'Proton_Density', 'Kp_Index']

df = pd.read_csv('omni2_enILRRjdGK.txt',
                 sep=r'\s+',
                 names=sutun_isimleri,
                 na_values=[99.9, 999, 999.9, 9999, 99999])

# String dönüşümü yapmadan doğrudan zaman hesaplaması
zaman_yili = pd.to_datetime(df['Year'], format='%Y')
gun_farki = pd.to_timedelta(df['DOY'] - 1, unit='D')
saat_farki = pd.to_timedelta(df['Hour'], unit='h')

df['Datetime'] = zaman_yili + gun_farki + saat_farki

df = df.drop(columns=['Year', 'DOY', 'Hour']).set_index('Datetime')
print(df.head())
