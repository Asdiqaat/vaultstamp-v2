export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'checkFileExists' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'findFilesWithSimilarPhash' : IDL.Func(
        [IDL.Nat64],
        [
          IDL.Vec(
            IDL.Record({
              'owner' : IDL.Principal,
              'hash' : IDL.Text,
              'name' : IDL.Text,
              'similarity' : IDL.Nat,
              'phash' : IDL.Nat64,
            })
          ),
        ],
        [],
      ),
    'getAlerts' : IDL.Func([], [IDL.Vec(IDL.Text)], []),
    'getFiles' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'hash' : IDL.Text,
              'name' : IDL.Text,
              'size' : IDL.Nat,
              'fileType' : IDL.Text,
              'timestamp' : IDL.Int,
              'phash' : IDL.Nat32,
            })
          ),
        ],
        [],
      ),
    'sendDummyNotification' : IDL.Func([], [IDL.Text], []),
    'uploadFile' : IDL.Func(
        [IDL.Text, IDL.Vec(IDL.Nat8), IDL.Text],
        [IDL.Text],
        [],
      ),
    'verifyFileByHash' : IDL.Func(
        [IDL.Text],
        [
          IDL.Opt(
            IDL.Record({
              'owner' : IDL.Principal,
              'name' : IDL.Text,
              'fileType' : IDL.Text,
              'timestamp' : IDL.Int,
              'phash' : IDL.Nat32,
            })
          ),
        ],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
